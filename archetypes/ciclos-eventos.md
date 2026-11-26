---
title: "{{ replace .Name "-" " " | title }}"
weight: 10
build:
  render: never
  list: always
# Intro del ciclo — usar bloques[] o legacy lead + intro
bloques:
  - tipo: lead-col
    lead: "Texto introductorio en itálica (columna izquierda)."
    texto: "Texto explicativo del ciclo (columna derecha)."
# Tipos de bloque: lead-col | dos-columnas | ancho | lead | texto
# bloques:
#   - tipo: dos-columnas
#     col_izq: "Columna izquierda (texto regular)."
#     col_der: "Columna derecha (texto regular)."
eventos:
  - titulo: "Nombre del evento."
    bloques:
      - tipo: lead-col
        lead: "Lead itálica del evento."
        texto: "Cuerpo del evento."
    # galeria:
    #   - alt: "Foto 1"
    #     placeholder: true
    #     orientacion: apaisada
    # audios:
    #   - titulo: "Registro de voz"
    #     src: "/audio/ejemplo.mp3"
---
