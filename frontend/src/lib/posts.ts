export interface FAQ {
  question: string;
  answer: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
  faqs: FAQ[];
}

export const posts: Post[] = [
  {
    slug: "adjudicacion-destinos-oposiciones",
    title: "Adjudicación de destinos: qué hacer cuando publican el listado de vacantes",
    description:
      "Acaban de publicar la adjudicación de destinos de tu oposición y tienes pocos días para elegir. Guía práctica para ordenar el listado y no dejarlo al azar.",
    date: "2026-04-05",
    content: `
Llega el mensaje al grupo de Telegram, al foro o al correo: **ha salido el listado de vacantes y hay X días para ordenar preferencias**. A partir de ese momento empieza una de las decisiones más importantes de tu carrera como funcionario, y lo habitual es afrontarla con prisas, un PDF interminable y Google Maps abierto en 40 pestañas.

Esta guía es para ese momento exacto: cuando tienes el listado delante y necesitas ordenarlo **rápido y con criterio**.

## 1. Lo primero: entender qué tienes delante

Un listado de adjudicación de destinos suele contener:

- Código del centro o plaza
- Municipio (a veces también provincia y comunidad autónoma)
- Tipo de puesto
- Observaciones (itinerante, bilingüe, características específicas…)

Antes de ordenar nada, **abre el archivo y comprueba que las columnas son claras**. Si la administración publica un PDF, conviértelo a Excel — cualquier conversor online gratuito sirve, y te ahorrará horas después.

## 2. La distancia no es el único criterio, pero suele ser el primer filtro

Cuando tienes 150 plazas y 72 horas, no puedes analizar cada una con detalle. Lo que sí puedes hacer es **filtrar brutalmente por distancia** para quedarte con un subconjunto manejable.

Un flujo realista:

1. Ordena las plazas por distancia desde tu domicilio
2. Marca un umbral razonable (por ejemplo, "todo lo que esté a menos de 80 km")
3. Ese subconjunto ya es tu lista corta
4. Sobre esa lista corta aplicas el resto de criterios con más calma

Para el paso 1, herramientas como [Destinos Oposiciones](https://destinosoposiciones.rafatorresgarcia.com/herramienta) calculan la distancia por carretera a todas las plazas de golpe. Subes el Excel, indicas tu municipio y en segundos tienes el listado ordenado.

## 3. Sobre la lista corta, aplica los criterios que sí importan

Una vez reducido el listado a 10-20 plazas razonables, sí merece la pena mirar plaza por plaza:

- **Tiempo real de desplazamiento** (no kilómetros): una plaza a 70 km por autovía es mejor que una a 45 km por carretera secundaria
- **Coste de vivienda** en el municipio y alrededores
- **Servicios del centro**: horarios, tamaño, especialidad
- **Posibilidad de traslado futuro**: plazas en destinos con mucha movilidad suelen ser puertas de entrada hacia otras más deseadas

## 4. El orden de preferencias: no pongas solo las que te gustan

Un error frecuente es ordenar únicamente las 5 plazas ideales y dejar el resto al azar. **La adjudicación respeta tu orden estricto**: si tus 5 primeras no caen y el resto están sin priorizar, puedes acabar en la plaza más lejana del listado.

La estrategia razonable es:

1. Las que realmente quieres (prioridad alta)
2. Las aceptables ordenadas por distancia (bloque intermedio)
3. Las que aceptarías a regañadientes pero prefieres a la peor opción (bloque final)

Ordenar 150 plazas a mano es inviable, pero ordenarlas por distancia automáticamente y ajustar los bloques a mano sí es factible en una tarde.

## 5. No lo hagas solo

Los foros de opositores, los grupos de Telegram y los compañeros de convocatoria son una fuente de información valiosísima sobre destinos concretos: cuál tiene buen ambiente, cuál está reformado, cuál suele quedar vacante cada año. Cruzar tu lista corta con esa información cualitativa es lo que diferencia una buena decisión de una regular.

## Resumen del proceso

1. **Convierte el listado a Excel** si viene en PDF
2. **Ordena por distancia** con una herramienta automática (no una por una en Google Maps)
3. **Filtra** las que entran en tu umbral razonable
4. **Analiza con detalle** solo las que pasan el filtro
5. **Construye tu orden de preferencias** por bloques, cubriendo todas las plazas aceptables
6. **Consulta a otros opositores** para los detalles cualitativos

Lo importante no es hacerlo perfecto, sino hacerlo **con datos y no a ojo**. Una decisión así marca los próximos años de tu vida profesional y personal: invertir un par de horas bien en ordenarlo compensa sobradamente.

    `,
    faqs: [
      {
        question: "¿Cuánto tiempo se suele dar para ordenar preferencias en una adjudicación de destinos?",
        answer: "Depende del cuerpo y la convocatoria, pero los plazos habituales están entre 3 y 10 días hábiles desde la publicación del listado. Algunas adjudicaciones son casi inmediatas y otras dan semanas, por eso conviene tener el listado ordenado por distancia cuanto antes.",
      },
      {
        question: "¿Qué pasa si no ordeno todas las plazas del listado?",
        answer: "Las plazas que dejes sin ordenar quedan al final automáticamente y en orden arbitrario. Si no caes en las que sí priorizaste, puedes acabar en cualquier plaza no priorizada, incluso en la más lejana. Por eso es recomendable ordenar todas, aunque sea en bloques.",
      },
      {
        question: "¿Puedo convertir un PDF de adjudicación a Excel para procesarlo?",
        answer: "Sí. Cualquier conversor de PDF a Excel online (gratuito o de pago) funciona si el PDF contiene tablas estructuradas. Una vez tengas el Excel con una columna llamada 'MUNICIPIO', puedes procesarlo directamente en Destinos Oposiciones.",
      },
      {
        question: "¿Cómo combino distancia y otros criterios al ordenar preferencias?",
        answer: "Lo más práctico es usar la distancia como primer filtro para quedarte con una lista corta (por ejemplo, todo lo que esté a menos de 80 km). Sobre esa lista corta ya puedes aplicar con detalle otros criterios como coste de vida, transporte, tipo de centro o perspectivas de traslado futuro.",
      },
    ],
  },
  {
    slug: "como-elegir-destino-oposiciones",
    title: "Cómo elegir destino en unas oposiciones: guía práctica",
    description:
      "Criterios clave para elegir la mejor plaza en oposiciones, bolsas de interinos o concursos de traslados. Distancia, coste de vida, transporte y más.",
    date: "2026-03-28",
    content: `
Has aprobado la oposición (o estás en bolsa) y toca lo más difícil: **elegir destino**. Con decenas o cientos de plazas disponibles repartidas por toda la geografía, la decisión puede ser abrumadora.

En esta guía repasamos los criterios más importantes y cómo organizarte para tomar la mejor decisión.

## 1. La distancia a tu domicilio

Es el factor que más pesa para la mayoría de opositores. Una plaza a 30 km no es lo mismo que una a 200 km: implica mudanza, doble vivienda o horas de carretera diarias.

**El problema**: calcular la distancia a cada plaza una por una en Google Maps es tedioso. Si tienes un listado de 80 municipios, puedes tirarte toda la tarde.

**La solución**: herramientas como [Destinos Oposiciones](https://destinosoposiciones.rafatorresgarcia.com/herramienta) calculan la distancia real por carretera a todas las plazas de golpe. Subes el Excel, indicas tu municipio y en segundos tienes todo ordenado.

## 2. Coste de vida en el municipio

No todas las localidades cuestan lo mismo. Un piso en una capital de provincia puede costar el doble que en un pueblo cercano. Valora:

- **Precio del alquiler** en la zona (consulta Idealista o Fotocasa)
- **Gastos de transporte** si no vives en el mismo municipio
- **Servicios disponibles** (sanidad, comercios, ocio)

## 3. Transporte y comunicaciones

Aunque una plaza esté a 60 km, puede ser más accesible que otra a 40 km si tiene:

- Buena conexión por autovía
- Transporte público (tren de cercanías, autobús interurbano)
- Aparcamiento accesible

La distancia en kilómetros importa, pero el **tiempo real de desplazamiento** es lo que vives cada día.

## 4. Perspectivas de traslado

Si eliges un destino lejano, ¿cuánto tiempo tardarás en poder pedir traslado? Investiga:

- Cuántos años mínimos necesitas en el puesto para pedir traslado
- Si hay concursos de traslados frecuentes en tu cuerpo
- Qué plazas suelen quedar vacantes en zonas que te interesen

## 5. Organízate con datos, no con intuición

La clave es **no improvisar**. Descárgate el listado oficial de plazas, calcula las distancias, filtra por tus criterios y haz una lista corta de 5-10 opciones realistas.

Herramientas como Destinos Oposiciones están pensadas exactamente para esto: transformar un listado caótico en información ordenada y útil para tomar una decisión informada.

    `,
    faqs: [
      {
        question: "¿Cuánto tiempo tengo para elegir destino en una oposición?",
        answer: "Depende del cuerpo y la convocatoria. Normalmente se publica un plazo en el BOE o boletín autonómico que puede ir desde unos días hasta varias semanas. Consulta siempre las bases de tu convocatoria específica.",
      },
      {
        question: "¿Puedo cambiar de destino después de elegir?",
        answer: "En general, una vez adjudicado el destino no puedes cambiarlo hasta el siguiente concurso de traslados. El tiempo mínimo de permanencia suele ser de 2 años, aunque varía según el cuerpo.",
      },
      {
        question: "¿Es mejor elegir una plaza cercana o una en una ciudad grande?",
        answer: "Depende de tus prioridades. Una plaza cercana te ahorra tiempo y dinero de desplazamiento. Una ciudad grande puede ofrecer más servicios y opciones de conciliación. Lo ideal es valorar ambos factores con datos concretos.",
      },
      {
        question: "¿La distancia por carretera es el mejor criterio para elegir destino?",
        answer: "Es uno de los más importantes, pero no el único. También deberías valorar el tiempo real de desplazamiento, el coste de vida, la disponibilidad de transporte público y las perspectivas de traslado futuro.",
      },
    ],
  },
  {
    slug: "ordenar-plazas-oposiciones-por-distancia",
    title: "Cómo ordenar las plazas de tu oposición por distancia desde casa",
    description:
      "Paso a paso para calcular la distancia por carretera a todas las plazas de una oposición a la vez, sin buscar una por una en Google Maps.",
    date: "2026-03-28",
    content: `
Cuando sale el listado de plazas de una oposición, lo primero que hace todo el mundo es buscar los municipios en Google Maps. Uno por uno. Es lento, tedioso y fácil de equivocarse.

En este artículo te explicamos **cómo calcular la distancia a todas las plazas a la vez** y tener el listado ordenado en segundos.

## El problema: listados largos y Google Maps

Un listado típico de plazas puede tener entre 20 y 200 municipios. Buscar cada uno manualmente implica:

- Abrir Google Maps
- Escribir tu municipio como origen
- Escribir el municipio de destino
- Anotar los kilómetros
- Repetir 199 veces más

Con 100 plazas, esto puede llevar **2-3 horas**. Y si te equivocas en un municipio, los datos quedan mal.

## La solución: calcula todas las distancias a la vez

Con [Destinos Oposiciones](https://destinosoposiciones.rafatorresgarcia.com/herramienta) el proceso es:

### Paso 1: Prepara tu Excel

Solo necesitas que el archivo tenga una columna llamada **"MUNICIPIO"**. Si además tiene una columna "PROVINCIA", mejor, porque ayuda a localizar municipios con nombres repetidos (hay varios "Santiago" en España, por ejemplo).

El resto de columnas del Excel se conservan intactas — código de plaza, tipo de puesto, observaciones… todo se mantiene.

### Paso 2: Sube el archivo e indica tu municipio

Entra en la herramienta, escribe el nombre de tu localidad de referencia y sube el Excel. La herramienta usa **Google Maps** para calcular la distancia real por carretera (no en línea recta) a cada municipio del listado.

### Paso 3: Descarga el resultado

En segundos tendrás el listado completo con una nueva columna de **distancia en kilómetros**, ordenado de más cerca a más lejos. Puedes descargarlo como CSV para abrirlo en Excel.

## ¿La distancia es en línea recta?

No. La distancia se calcula **por carretera**, usando las rutas reales de Google Maps. Es la misma distancia que verías si hicieras la búsqueda manualmente, pero calculada para todas las plazas a la vez.

## ¿Funciona para cualquier tipo de oposición?

Sí. La herramienta funciona con cualquier listado de municipios: oposiciones del Estado, autonómicas, bolsas de interinos, concursos de traslados, comisiones de servicio…

Lo único que necesitas es un Excel con los nombres de los municipios.

    `,
    faqs: [
      {
        question: "¿Qué formato debe tener el Excel para calcular distancias?",
        answer: "Solo necesitas que tenga una columna llamada 'MUNICIPIO' con los nombres de las localidades. Si tiene también una columna 'PROVINCIA', la herramienta la usará para desambiguar municipios con nombres iguales. El resto de columnas se conservan intactas.",
      },
      {
        question: "¿Cuántas plazas puedo procesar a la vez?",
        answer: "No hay un límite práctico. La herramienta procesa cada municipio de forma secuencial usando Google Maps, así que puedes subir listados de cientos de plazas sin problema.",
      },
      {
        question: "¿Puedo usar un archivo CSV en vez de Excel?",
        answer: "Actualmente la herramienta acepta archivos en formato Excel (.xlsx). Si tienes un CSV, puedes abrirlo en Excel o Google Sheets y guardarlo como .xlsx antes de subirlo.",
      },
      {
        question: "¿La herramienta guarda mis datos o mi listado de plazas?",
        answer: "No. El archivo se procesa en el momento y no se almacena en ningún servidor. Una vez calculas las distancias y descargas el resultado, los datos se eliminan automáticamente.",
      },
    ],
  },
  {
    slug: "bolsa-interinos-elegir-plaza-cercana",
    title: "Bolsa de interinos: cómo encontrar las plazas más cercanas a tu casa",
    description:
      "Si estás en una bolsa de interinos y te llaman para elegir plaza, aprende a identificar rápidamente las opciones más cercanas a tu domicilio.",
    date: "2026-03-28",
    content: `
Estás en bolsa de interinos y llega el momento: te llaman para elegir plaza. Tienes un listado de vacantes y poco tiempo para decidir. **¿Cómo identificas rápidamente qué plazas te quedan más cerca?**

## La presión del tiempo

A diferencia de una oposición donde puedes pensarlo con calma, en las bolsas de interinos a menudo tienes que responder en **24-48 horas**. No hay tiempo para buscar 50 municipios uno a uno en Google Maps.

## Organiza el listado antes de que te llamen

Si sabes que estás en bolsa y pueden llamarte, **prepárate con antelación**:

1. Descarga el listado de centros o municipios con vacantes habituales
2. Súbelo a [Destinos Oposiciones](https://destinosoposiciones.rafatorresgarcia.com/herramienta)
3. Guarda el resultado ordenado por distancia

Así, cuando llegue la llamada, ya tendrás claro qué plazas te interesan y cuáles descartarías.

## ¿Qué distancia es asumible?

Depende de cada persona, pero estos son rangos habituales entre interinos:

- **Hasta 30 km**: ideal, desplazamiento diario cómodo
- **30-60 km**: asumible, sobre todo si hay buena carretera
- **60-100 km**: valorar si compensa frente a alquiler en destino
- **Más de 100 km**: generalmente implica mudanza o alojamiento temporal

Con el listado ordenado por distancia, puedes trazar una línea clara: "acepto hasta X km" y tener tus opciones filtradas.

## Municipios con nombres ambiguos

España tiene municipios con nombres repetidos o muy similares. Por ejemplo, hay varios "Villanueva" en distintas provincias. Si tu Excel tiene una columna **"PROVINCIA"**, la herramienta la usa para desambiguar y calcular la distancia al municipio correcto.

## No solo para la primera llamada

Cada vez que se actualice el listado de vacantes, puedes volver a procesarlo. Es gratuito y tarda segundos, así que puedes repetirlo tantas veces como necesites durante toda la vida de la bolsa.

    `,
    faqs: [
      {
        question: "¿Cuánto tiempo tengo para elegir plaza cuando me llaman de la bolsa?",
        answer: "Varía según la administración y la bolsa, pero lo habitual es entre 24 y 72 horas. Algunas bolsas dan más margen, pero conviene tener el listado ya ordenado por distancia antes de que te llamen.",
      },
      {
        question: "¿Puedo rechazar una plaza de la bolsa y seguir en ella?",
        answer: "Depende de las bases de la bolsa. En muchas bolsas de interinos, rechazar una plaza implica pasar al final de la lista o incluso ser excluido. Consulta siempre las bases de tu bolsa específica.",
      },
      {
        question: "¿Cómo sé qué plazas están vacantes en mi bolsa de interinos?",
        answer: "Las administraciones publican los listados de vacantes en sus portales web o te los envían cuando te llaman. Descarga ese listado en Excel y usa Destinos Oposiciones para ordenarlo por distancia desde tu domicilio.",
      },
      {
        question: "¿Qué distancia máxima es razonable para ir a trabajar cada día?",
        answer: "Depende de cada persona, pero los rangos más comunes entre interinos son: hasta 30 km (cómodo), 30-60 km (asumible con buena carretera), 60-100 km (valorar alquiler en destino), más de 100 km (suele implicar mudanza temporal).",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
