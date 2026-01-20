# Documentación Técnica: Arquitectura Eagle-Eye WebRTC

## 1. Visión General
Eagle-Eye es un sistema de vigilancia en tiempo real diseñado para procesar video vía streaming de ultra-baja latencia. Utiliza **WebRTC** para la transmisión de video y **Canales de Datos** bidireccionales para la telemetría, permitiendo análisis en el servidor sin detener el flujo de video del cliente.

---

## 2. Flujo Paso a Paso (Workflow)

### Paso 1: Señalización (Signaling)
Antes de que exista video, el Cliente y el Servidor deben "presentarse".
1.  **Cliente**: Crea una oferta SDP (Session Description Protocol) que dice "Soy un navegador, soporte estos codecs, esta es mi IP".
2.  **Transporte**: Envía esto vía HTTP POST `/offer` a **FastAPI**.
3.  **Servidor**: FastAPI recibe la oferta, inicializa `aiortc` y responde con su propia SDP ("Ok, acepto, usemos el codec H.264").

### Paso 2: Establecimiento Peer-to-Peer
Una vez intercambiadas las SDP, se abre la conexión directa (o vía TURN).
*   **Protocolo**: UDP (User Datagram Protocol).
*   **Beneficio**: Si se pierde un paquete de video, no se reintenta (evita lag), simplemente se muestra el siguiente frame.

### Paso 3: Intercepción de Video (`DetectionStreamTrack`)
El video no solo "pasa". El servidor lo intercepta.
1.  El frame llega crudo al servidor vía `aiortc`.
2.  La clase `DetectionStreamTrack` captura el frame en el método `recv()`.
3.  **Transformación**: Convierte el frame de formato WebRTC a `numpy array` (OpenCV).

### Paso 4: Procesamiento Paralelo e Híbrido
Aquí ocurre la magia del análisis sin bloquear el video.
1.  El orquestador (`analyzer.py`) recibe el frame.
2.  Lanza 3 hilos de ejecución simultánea (`ThreadPoolExecutor`):
    *   **Hilo 1 (Vehículos)**: Algoritmo ligero o mock.
    *   **Hilo 2 (Armas)**: Algoritmo ligero o mock.
    *   **Hilo 3 (Placas)**: Proceso pesado (Roboflow API + Tesseract OCR).
3.  Al usar hilos, el bucle principal de Python (`asyncio`) no se congela, permitiendo que sigan llegando paquetes de red.

### Paso 5: Respuesta (DataChannel vs Video)
*   **Video**: El frame original (o pintado) se devuelve al pipeline para que `aiortc` mantenga el flujo fluido.
*   **Datos**: El resultado JSON `{ "plate": "BKA-902", ... }` se envía por el **RTCDataChannel**. Esto es crucial: los datos viajan por un carril paralelo al video, sincronizados pero independientes.

---

## 3. Stack Tecnológico y Análisis Comparativo

### A. Lenguaje: Python 3.11+
*   **Elección**: Python es el estándar de facto para IA/CV (OpenCV, PyTorch, YOLO).
*   **Comparativa**:
    *   *vs Node.js*: Node.js es más rápido en I/O puro, pero pésimo para procesamiento de imágenes pesado (CPU bound) y carece de librerías nativas robustas de IA como PyTorch.
    *   *vs C++*: C++ es más rápido, pero el tiempo de desarrollo es 10x mayor. Python ofrece el mejor balance velocidad-desarrollo.

### B. Framework Web: FastAPI
*   **Elección**: Framework moderno, nativo asíncrono (`async`/`await`).
*   **Comparativa**:
    *   *vs Flask*: Flask es sincrónico (bloqueante). Si procesas un frame en Flask, nadie más puede conectarse hasta que termines.
    *   *vs Django*: Demasiado pesado ("baterías incluidas") y su soporte asíncrono no es tan nativo como FastAPI.

### C. Protocolo de Video: WebRTC (vía `aiortc`)
*   **Elección**: Estándar mundial para videollamadas (Zoom, Meet). Latencia sub-500ms.
*   **Comparativa**:
    *   *vs WebSocket (Base64)*: (Tu intento anterior). Codificar video a texto Base64 aumenta el tamaño un 33%. TCP obliga a reintentar paquetes perdidos, generando "efecto bufereo".
    *   *vs RTSP*: RTSP es bueno para cámaras, pero los navegadores NO lo soportan nativamente. Requiere transcodificación intermedia (ffmpeg) que añade 2-5 segundos de lag. **WebRTC es nativo del navegador.**

### D. Librería CV: OpenCV + Roboflow + Tesseract
*   **Elección**: Combinación híbrida (Nube + Local).
*   **Comparativa**:
    *   *Roboflow (Nube)*: Modelos SOTA (State of the Art) sin necesitar una GPU potente local. Desventaja: Latencia de red.
    *   *YOLO Local*: Requiere hardware potente (GPU NVIDIA) en el servidor. Si el servidor es CPU-only, Roboflow es mejor.
    *   *Tesseract*: OCR Local. Es lento pero gratuito y privado.

### E. Concurrencia: `asyncio` + `ThreadPoolExecutor`
*   **Elección**: Modelo híbrido.
*   **Explicación**: `asyncio` maneja miles de conexiones de red (WebRTC). `ThreadPool` maneja el trabajo sucio de CPU (procesar la imagen).
*   **Comparativa**:
    *   *vs Solo Asyncio*: Bloquearía el servidor al hacer OCR.
    *   *vs Multiprocessing*: Demasiado overhead de memoria para cada frame (copiar memoria entre procesos es lento). Threads comparten memoria, ideal para imágenes.

---

## 4. Ejemplo Técnico Detallado

### El "Interceptor" de Video (`DetectionStreamTrack`)

Este es el componente crítico que hace que todo funcione junto:

```python
class DetectionStreamTrack(MediaStreamTrack):
    def __init__(self, track):
        super().__init__()
        self.track = track  # El track original del cliente

    async def recv(self):
        # 1. Leer frame del cliente (Async)
        frame = await self.track.recv()
        
        # 2. Convertir a formato OpenCV (CPU Bound - Rápido)
        img = frame.to_ndarray(format="bgr24")
        
        # 3. Disparar Análisis (Async Wrapper sobre ThreadPool)
        # Esto NO detiene el flujo de video gracias al 'await' no bloqueante
        asyncio.create_task(self.analizar_y_enviar(img))
        
        # 4. Devolver frame INMEDIATAMENTE para mantener fluidez visual
        return frame
```

### El Orquestador Paralelo (`analyzer.py`)

Cómo ejecutamos 3 inteligencias a la vez:

```python
# ThreadPool: 3 trabajadores listos
executor = ThreadPoolExecutor(max_workers=3)

async def analyze_frame_bytes(frame_bytes):
    loop = asyncio.get_event_loop()
    
    # Lanzar tareas al pool (no bloquean el main loop)
    task1 = loop.run_in_executor(executor, detect_vehicle, frame_bytes)
    task2 = loop.run_in_executor(executor, detect_plate, frame_bytes) # Lento
    task3 = loop.run_in_executor(executor, detect_weapon, frame_bytes)
    
    # Esperar a que los 3 terminen (Gather)
    # El tiempo total será = al más lento de los 3 (no la suma)
    results = await asyncio.gather(task1, task2, task3)
    
    return results
```

---

## 5. Detalle Deep Dive: Reconocimiento de Placas (`plate_detector.py`)

Esta función es la más compleja del sistema. No es una simple llamada a una API, sino un pipeline de 4 etapas optimizado para precisión.

### El Desafío
Leer una placa requiere dos cosas:
1.  **Localización**: Saber *dónde* está la placa en la imagen (Bounding Box).
2.  **OCR**: Leer las letras *dentro* de ese recuadro.

### El Pipeline Implementado

#### Etapa 1: Decodificación y Preparación
El frame llega como `bytes` comprimidos.
```python
nparr = np.frombuffer(frame_bytes, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
```

#### Etapa 2: Localización (Roboflow Inference)
Usamos un modelo de IA entrenado específicamente para detectar objetos tipo "Placa".
*   **Tecnología**: Roboflow Inference SDK.
*   **Por qué**: Es mucho más robusto que OpenCV puro para encontrar placas en ángulos difíciles o con poca luz.
*   **Salida**: Coordenadas `(x, y, width, height)`.

#### Etapa 3: Extracción y Pre-procesamiento (OpenCV)
Una vez que sabemos dónde está la placa, la recortamos y la "limpiamos" para facilitar la lectura.
```python
# Recorte
plate_img = img[y1:y2, x1:x2]

# Limpieza para OCR (Binarización)
gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
# Escalar 4x para que las letras sean grandes y claras
gray = cv2.resize(gray, None, fx=4.0, fy=4.0, interpolation=cv2.INTER_CUBIC)
# Umbralización OTSU (Blanco y Negro puro)
_, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
```
*Este paso es crítico. Sin escalar y binarizar, Tesseract falla en el 80% de los casos.*

#### Etapa 4: Reconocimiento Óptico de Caracteres (Tesseract)
Finalmente, pasamos la imagen limpia a Tesseract con una configuración estricta.
*   `--psm 7`: "Trata la imagen como una sola línea de texto" (Ideal para placas).
*   `whitelist`: Solo permite caracteres `A-Z0-9-`. Evita que confunda una grieta con una coma.

```python
text = pytesseract.image_to_string(binary, config='--psm 7 ...')
```

### Optimización de Rendimiento
Todo este proceso toma entre 200ms y 500ms dependiendo de la CPU.
Si lo ejecutáramos en el hilo principal, el video iría a 2 cuadros por segundo.
**Solución**: Se ejecuta dentro de `loop.run_in_executor(None, ...)` para que corra en un hilo separado, permitiendo que el video siga fluyendo a 30fps mientras se procesa la placa en segundo plano.

---

## 5. Detalle Deep Dive: Reconocimiento de Placas (`plate_detector.py`)

Esta función es la más compleja del sistema. No es una simple llamada a una API, sino un pipeline de 4 etapas optimizado para precisión.

### El Desafío
Leer una placa requiere dos cosas:
1.  **Localización**: Saber *dónde* está la placa en la imagen (Bounding Box).
2.  **OCR**: Leer las letras *dentro* de ese recuadro.

### El Pipeline Implementado

#### Etapa 1: Decodificación y Preparación
El frame llega como `bytes` comprimidos.
```python
nparr = np.frombuffer(frame_bytes, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
```

#### Etapa 2: Localización (Roboflow Inference)
Usamos un modelo de IA entrenado específicamente para detectar objetos tipo "Placa".
*   **Tecnología**: Roboflow Inference SDK.
*   **Por qué**: Es mucho más robusto que OpenCV puro para encontrar placas en ángulos difíciles o con poca luz.
*   **Salida**: Coordenadas `(x, y, width, height)`.

#### Etapa 3: Extracción y Pre-procesamiento (OpenCV)
Una vez que sabemos dónde está la placa, la recortamos y la "limpiamos" para facilitar la lectura.
```python
# Recorte
plate_img = img[y1:y2, x1:x2]

# Limpieza para OCR (Binarización)
gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
# Escalar 4x para que las letras sean grandes y claras
gray = cv2.resize(gray, None, fx=4.0, fy=4.0, interpolation=cv2.INTER_CUBIC)
# Umbralización OTSU (Blanco y Negro puro)
_, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
```
*Este paso es crítico. Sin escalar y binarizar, Tesseract falla en el 80% de los casos.*

#### Etapa 4: Reconocimiento Óptico de Caracteres (Tesseract)
Finalmente, pasamos la imagen limpia a Tesseract con una configuración estricta.
*   `--psm 7`: "Trata la imagen como una sola línea de texto" (Ideal para placas).
*   `whitelist`: Solo permite caracteres `A-Z0-9-`. Evita que confunda una grieta con una coma.

```python
text = pytesseract.image_to_string(binary, config='--psm 7 ...')
```

### Optimización de Rendimiento
Todo este proceso toma entre 200ms y 500ms dependiendo de la CPU.
Si lo ejecutáramos en el hilo principal, el video iría a 2 cuadros por segundo.
**Solución**: Se ejecuta dentro de `loop.run_in_executor(None, ...)` para que corra en un hilo separado, permitiendo que el video siga fluyendo a 30fps mientras se procesa la placa en segundo plano.
