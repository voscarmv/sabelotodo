# sabelotodo
IA educativa autosuficiente y de bajo costo para aulas rurales

## Consideraciones iniciales

Decisiones relacionadas con el diseño y la arquitectura, incluyendo la selección de hardware y la pila de software a emplear.

### Hardware

* Orientado a sistemas de bajo costo: **Raspberry Pi 4**.
* Preferentemente, un micrófono de conferencia económico que permita a los estudiantes formular preguntas de manera abierta en el aula.
* Altavoces PCM estándar de tamaño reducido, para garantizar que todos los presentes puedan escuchar claramente las respuestas.

### Software

Se priorizará el uso de herramientas **libres y de código abierto** con el fin de facilitar la personalización y modificación por parte de estudiantes y desarrolladores.

* Utilizar **ollama** para desplegar el modelo **qwen2.5:3b**, el cual debería ejecutarse de manera fluida en una **Raspberry Pi 4** con 4 GB de RAM.
* Implementar **LangSearch** o **Internet-in-a-Box** como base de conocimiento local.
* Incorporar un sistema **RAG** (Retrieval-Augmented Generation), opcionalmente administrado mediante **LangChain**.
* Para el reconocimiento de palabras clave por voz (similar a “Hey Google”, “Alexa” o “Siri”), emplear **rhasspy-remote-http-hermes**.



