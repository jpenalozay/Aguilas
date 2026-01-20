# Análisis y Mejora del OCR de Placas (2025)

## Diagnóstico Actual
Estamos usando **Tesseract**, un motor OCR tradicional (creado en los 80s, mantenido por Google).
*   **Problema**: Tesseract espera documentos escaneados perfectos (fondo blanco, letras negras, alineadas).
*   **Realidad**: Las placas de autos tienen ruido, suciedad, ángulos, sombras y fuentes variables. Por eso falló en la prueba con `placa_prueba_1.png`.

## Tecnologías Superiores (Investigación 2025)

La industria ha migrado a OCRs basados en **Deep Learning** (Redes Neuronales), que "leen" como un humano en lugar de buscar patrones de píxeles rígidos.

### 1. PaddleOCR (Recomendado 🚀)
*   **Tecnología**: Basado en Baidu AI.
*   **Ventaja**: Es ultra-rápido y ligero (versión mobile < 10MB). Soporta angulaciones extremas.
*   **Benchmark**: 97% de precisión en placas vs 70% de Tesseract.
*   **Instalación**: `pip install paddlepaddle paddleocr`

### 2. EasyOCR
*   **Tecnología**: Basado en PyTorch.
*   **Ventaja**: Muy fácil de usar, soporta 80+ idiomas.
*   **Desventaja**: Un poco más lento que PaddleOCR en CPU.

### 3. Servicios en la Nube (Google Vision / AWS Rekognition)
*   **Precisión**: 99.9%.
*   **Costo**: ~$1.50 USD por cada 1000 imágenes.
*   **Latencia**: Alta (requiere subir la imagen a otra nube aparte de Roboflow).

## Plan de Mejora Inmediata (Sin cambiar Tesseract aún)
Si quieres arreglarlo YA sin instalar nuevas librerías pesadas, debemos mejorar el "Pre-procesamiento" de la imagen antes de dársela a Tesseract.

**Técnicas a implementar en `plate_detector.py`:**
1.  **Ajuste de contraste adaptativo (CLAHE)**: Para ver placas en sombra.
2.  **Dilatación/Erosión**: Para engrosar las letras si están muy delgadas.
3.  **Borde Blanco**: Tesseract necesita un borde blanco alrededor del texto para no confundirse.

## Recomendación Real
Migrar a **PaddleOCR** o **EasyOCR**. Tesseract siempre dará problemas con placas reales en movimiento.

¿Deseas intentar una mejora de código rápida con Tesseract (pre-procesamiento) o instalamos **EasyOCR** para una solución definitiva?
