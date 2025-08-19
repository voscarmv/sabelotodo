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
* Implementar **Kiwix** como base de conocimiento local.
* Incorporar un sistema **RAG** (Retrieval-Augmented Generation), opcionalmente administrado mediante **LangChain**.
* Para el reconocimiento de palabras clave por voz (similar a “Hey Google”, “Alexa” o “Siri”), emplear una combinación de **voice2json** y **whisper** de OpenAI.

## Estado actual del desarrollo

1. Ejecuta `npm install`
2. Ejecuta `./install.sh` para instalar todas las dependencias necesarias.  
3. Haz una prueba con `./cli.sh`.  
4. Inicia un chat de texto con `node index.js`.
5. Inicia un chat por voz offline con `./listener3.sh`. 
5. Inicia un chat por voz en línea con deepseek con `./listener3.sh -o`. 

## Próximos pasos

1. Usar **kiwix-serve** como fuente de veracidad para RAG.  
2. Implementar un algoritmo de descomposición de consultas que busque buenos artículos candidatos con la búsqueda de kiwix y recorra los índices para extraer fragmentos relevantes que contextualicen la respuesta.  
3. Implementar una versión en línea que aproveche **deepseek** para optimizar los tiempos de procesamiento de la IA.  
