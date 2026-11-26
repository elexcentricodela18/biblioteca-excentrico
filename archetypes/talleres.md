---
title: "{{ replace .Name "-" " " | title }}"
weight: 10
build:
  render: never
  list: always
foto:
  src: "/img/equipo-excentrico/nombre.jpg"
  alt: "Nombre del docente"
  # Provisional: /img/equipo-excentrico/ → luego /img/talleres-seminarios/
rol: "Rol del docente"
bloques:
  - tipo: texto
    texto: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae."
# redes:  # solo si hay URL real; si no está, no se muestra
#   - plataforma: instagram
#     url: "https://www.instagram.com/usuario/"
#   - plataforma: web
#     url: "https://sitio.ejemplo/"
talleres:
  - titulo: "Nombre del taller."
    bloques:
      - tipo: dos-columnas
        col_izq: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
        col_der: "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae."
---
