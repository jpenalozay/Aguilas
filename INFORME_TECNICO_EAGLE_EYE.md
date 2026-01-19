# INFORME TÉCNICO: PROYECTO EAGLE-EYE LIMA
## Sistema Inteligente de Vigilancia Urbana y Predicción de Crímenes
**Institución:** Universidad Nacional de Ingeniería (UNI)  
**Contexto:** Seguridad Ciudadana - Lima, Perú  
**Versión:** 4.0.2 (C4 Metropolitan Edition)

---

## 1. RESUMEN EJECUTIVO
El proyecto **Eagle-Eye Lima** es una plataforma de software de última generación diseñada para centralizar el monitoreo de seguridad en zonas críticas de la capital peruana. Utilizando algoritmos de **Deep Learning (YOLOv8)** y **Modelos de Lenguaje de Gran Escala (LLM - Gemini)**, el sistema permite la detección proactiva de amenazas, reconocimiento de vehículos y análisis predictivo de comportamientos sospechosos para reducir los tiempos de respuesta de las fuerzas del orden.

---

## 2. JUSTIFICACIÓN: LA PROBLEMÁTICA DE CRIMINALIDAD EN LIMA
Lima enfrenta una crisis de seguridad ciudadana que requiere soluciones tecnológicas escalables:

### 2.1 Estadísticas y Patrones Comunes
*   **Robos en Motocicleta:** Un alto porcentaje de asaltos a mano armada se realizan utilizando motocicletas lineales para facilitar la huida en el tráfico denso de Lima (ej. Av. Brasil o Av. Salaverry).
*   **Armas de Fuego:** El incremento de la tenencia ilegal de armas ha vuelto los asaltos más letales.
*   **Fuga Vehicular:** La falta de un sistema integrado de LPR (License Plate Recognition) en tiempo real impide el seguimiento efectivo de vehículos robados a través de múltiples distritos.

### 2.2 Zonas de Intervención (Jesús María)
El distrito de Jesús María, debido a su alta densidad residencial y comercial, sirve como el "laboratorio" ideal para este sistema, integrando 48 nodos de vigilancia en puntos neurálgicos como el Campo de Marte y centros comerciales.

---

## 3. ARQUITECTURA TECNOLÓGICA

### 3.1 Motor de Visión: YOLO (You Only Look Once)
El sistema implementa un pipeline de procesamiento multimodal:
*   **Detección de Vehículos y Personas:** Identificación de clases específicas (Autos, Motos, Camiones) para análisis de flujo.
*   **Reconocimiento de Placas (LPR):** Extracción de caracteres de matrículas peruanas bajo condiciones variables de iluminación.
*   **Detección de Armas:** Entrenamiento especializado para identificar armas de fuego cortas y largas incluso en feeds de baja resolución.
*   **Procesamiento Multimodal:** Soporte para cámaras estándar, visión nocturna (NVG) y sensores térmicos para detección de firmas de calor humanas en la oscuridad total.

### 3.2 IA Predictiva y Análisis Táctico
A diferencia de sistemas de vigilancia pasivos, Eagle-Eye utiliza **Google Gemini AI** para:
1.  **Analizar Patrones:** Identificar merodeo, seguimiento de personas y aglomeraciones inusuales.
2.  **Generar Informes:** Cuando ocurre una alerta roja, la IA redacta en milisegundos un reporte táctico con la mejor estrategia de intervención para el Serenazgo o la PNP.

---

## 4. FUNCIONALIDADES CLAVE DEL APLICATIVO

### 4.1 Grid de Monitoreo de Alta Densidad (48 Nodos)
*   Visualización simultánea de 48 cámaras.
*   Telemetría individual por cámara: FPS, Bitrate, coordenadas GPS y nivel de anomalía local.
*   **Modo Táctico (Fullscreen):** Doble click para enfocar una cámara con HUD avanzado y análisis profundo.

### 4.2 Panel de Telemetría Inferior
Cada ventana de cámara cuenta con un log dinámico que muestra:
*   **Última Placa Reconocida:** Registro histórico de matrículas que pasan por el cuadrante.
*   **Clasificación de Objeto:** Identificación constante de lo que la IA está "viendo".
*   **Índice de Riesgo (Risk Bar):** Una barra de color (Cian-Naranja-Rojo) que cuantifica la probabilidad de un crimen en curso basándose en la conducta detectada.

### 4.3 Centro de Alerta Temprana
Un sistema de notificaciones críticas que bloquea la pantalla principal cuando el sistema detecta un arma o un "Atraco Predicho", forzando al operador a revisar el informe táctico generado por la IA.

---

## 5. ESPECIFICACIONES TÉCNICAS (STACK)
*   **Frontend:** React 19 + TypeScript + Tailwind CSS.
*   **Visualización de Datos:** Recharts para análisis de tendencias de criminalidad.
*   **Inteligencia Artificial:** 
    *   SDK de Google GenAI (Gemini 3 Flash).
    *   Simulación de Inferencia YOLOv8x.
*   **Diseño:** Interfaz Táctica de "Baja Fatiga Visual" con temática Dark de alta fidelidad.

---

## 6. CONCLUSIONES Y TRABAJO FUTURO
El sistema Eagle-Eye Lima representa un salto cualitativo de la seguridad reactiva a la **Seguridad Proactiva**. La integración de telemetría de placas y detección de armas bajo cada ventana de monitoreo reduce la carga cognitiva del operador humano, permitiendo que la IA actúe como un multiplicador de fuerza.

**Próximos Pasos:**
*   Integración con bases de datos de requisitorias de la PNP.
*   Detección acústica de disparos.
*   Seguimiento automático de vehículos sospechosos entre nodos (Hand-off inteligente).

---
*UNI - Facultad de Ingeniería Eléctrica y Electrónica*  
*Laboratorio de Inteligencia Artificial - 2024*