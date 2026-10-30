# Introducción a los modelos lineales mixtos (LMEM)

**Curso de formación del CIMCYC** para investigadores del centro ([página web del curso](https://cimcyc.ugr.es/formacion/portal-formacion/curso-lmem-v2026))  
**Autor:** Filip Andras — CIMCYC, Universidad de Granada  
**Edición:** noviembre-diciembre de 2026  
**Duración:** 20 horas presenciales, en 4 sesiones: viernes 13 y 27 de noviembre y 4 y 11 de diciembre de 2026

---

## Estructura del curso

Cada sesión tiene **3 bloques**: 9:00–10:30, 11:00–12:30 y 13:00–14:00.

| Sesión | Tema |
|--------|------|
| **Día 1** (13 nov) | Del modelo lineal a los modelos lineales mixtos: supuestos, efectos fijos y aleatorios, sintaxis en R |
| **Día 2** (27 nov) | Estructura de efectos aleatorios: singularidad, convergencia, *keep it maximal* vs. modelos parsimoniosos |
| **Día 3** (4 dic) | Codificación de contrastes e introducción a los modelos lineales generalizados |
| **Día 4** (11 dic) | Simulación de datos y análisis de potencia para modelos mixtos |

---

## Contenido por bloque

[POR DEFINIR: bloques de cada sesión]

### Día 1 — Del modelo lineal a los modelos lineales mixtos
- **Bloque 1:** Introducción a los modelos lineales mixtos
- **Bloque 2:** Efectos fijos y efectos aleatorios, verificación de supuestos estadísticos
- **Bloque 3:** Mi primer modelo mixto

### Día 2 — Estructura de efectos aleatorios
- **Bloque 1:** Selección de efectos aleatorios: modelo maximal vs. parsimonioso
- **Bloque 2:** Case studies
- **Bloque 3:** Ejercicios

### Día 3 — Codificación de contrastes y modelos lineales generalizados
- **Bloque 1:** Contrast coding
- **Bloque 2:** Modelos lineales generalizados
- **Bloque 3:** Ejercicios

### Día 4 — Simulación de datos y análisis de potencia
- **Bloque 1:** Simulaciones de datos para análisis de potencia estadística
- **Bloque 2:** Case studies
- **Bloque 3:** Cierre del curso


---

## Lo que aprenderás en el curso

[POR DEFINIR: lista de resultados de aprendizaje]

---

## Qué no cubre el curso

[POR DEFINIR]

---

## Presentaciones para estudiantes

[POR DEFINIR: cuando existan las presentaciones; mismo esquema que el curso de R, `slides/DiaX_bloqueY_student.html`]

---

## Estructura de carpetas

[POR DEFINIR: cuando exista el material]

---

## Datos

[POR DEFINIR: dataset(s) del curso]

---

## Lecturas recomendadas

Una lectura principal por sesión (en negrita) y algunas complementarias. Todas son tutoriales o artículos de métodos, no hace falta leerlas enteras antes de clase.

### Día 1 — Del modelo lineal a los modelos lineales mixtos

- **Winter, B. (2013).** *Linear models and linear mixed effects models in R with linguistic applications.* Dos tutoriales cortos: el modelo lineal y sus supuestos, y el paso a los modelos mixtos con `lme4` — <https://arxiv.org/abs/1308.5499>
- Brown, V. A. (2021). *An introduction to linear mixed-effects modeling in R.* Advances in Methods and Practices in Psychological Science, 4(1). Introducción conceptual y práctica, con datos y código en OSF — <https://doi.org/10.1177/2515245920960351>
- Judd, C. M., Westfall, J., & Kenny, D. A. (2012). *Treating stimuli as a random factor in social psychology.* Journal of Personality and Social Psychology, 103(1), 54-69. Por qué los estímulos también son un factor aleatorio, con ejemplos de psicología social — <https://doi.org/10.1037/a0028347>
- Lazic, S. E., & Essioux, L. (2013). *Improving basic and translational science by accounting for litter-to-litter variation in animal models.* BMC Neuroscience, 14, 37. La camada como unidad experimental y como efecto aleatorio — <https://doi.org/10.1186/1471-2202-14-37>
- Meteyard, L., & Davies, R. A. I. (2020). *Best practice guidance for linear mixed-effects models in psychological science.* Journal of Memory and Language, 112, 104092. Cómo construir y, sobre todo, cómo reportar un modelo mixto — <https://doi.org/10.1016/j.jml.2020.104092>
- Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). *Fitting linear mixed-effects models using lme4.* Journal of Statistical Software, 67(1), 1-48. El artículo del paquete, y la cita que hay que poner al reportar un modelo ajustado con `lme4`. Leer solo las secciones 1 y 2 (sintaxis de fórmulas y tabla de términos aleatorios) y 5 (cómo leer la salida, REML frente a ML, por qué `lmer` no da p-valores) — <https://doi.org/10.18637/jss.v067.i01>

### Día 2 — Estructura de efectos aleatorios

- **Barr, D. J., Levy, R., Scheepers, C., & Tily, H. J. (2013).** *Random effects structure for confirmatory hypothesis testing: Keep it maximal.* Journal of Memory and Language, 68(3), 255-278 — <https://doi.org/10.1016/j.jml.2012.11.001>
- **Bates, D., Kliegl, R., Vasishth, S., & Baayen, H. (2015).** *Parsimonious mixed models.* La respuesta a Barr et al.: por qué los modelos maximales no convergen y cómo simplificarlos — <https://arxiv.org/abs/1506.04967>
- Matuschek, H., Kliegl, R., Vasishth, S., Baayen, H., & Bates, D. (2017). *Balancing Type I error and power in linear mixed models.* Journal of Memory and Language, 94, 305-315. Las simulaciones que cierran el debate — <https://doi.org/10.1016/j.jml.2017.01.001>

### Día 3 — Codificación de contrastes y modelos lineales generalizados

- **Schad, D. J., Vasishth, S., Hohenstein, S., & Kliegl, R. (2020).** *How to capitalize on a priori contrasts in linear (mixed) models: A tutorial.* Journal of Memory and Language, 110, 104038 — <https://doi.org/10.1016/j.jml.2019.104038>
- Rabe, M. M., Vasishth, S., Hohenstein, S., Kliegl, R., & Schad, D. J. (2020). *hypr: An R package for hypothesis-driven contrast coding.* Journal of Open Source Software, 5(48), 2134. El paquete que genera las matrices de contrastes a partir de las hipótesis — <https://doi.org/10.21105/joss.02134>
- Winter, B. (2019). *Statistics for Linguists: An Introduction Using R.* Routledge. Capítulos de modelos lineales generalizados (regresión logística y de Poisson) — <https://doi.org/10.4324/9781315165547>
- Lo, S., & Andrews, S. (2015). *To transform or not to transform: Using generalized linear mixed models to analyse reaction time data.* Frontiers in Psychology, 6, 1171 — <https://doi.org/10.3389/fpsyg.2015.01171>
- Liddell, T. M., & Kruschke, J. K. (2018). *Analyzing ordinal data with metric models: What could possibly go wrong?* Journal of Experimental Social Psychology, 79, 328-348. Por qué una escala Likert no debería analizarse como si fuera métrica — <https://doi.org/10.1016/j.jesp.2018.08.009>

### Día 4 — Simulación de datos y análisis de potencia

- **Brysbaert, M., & Stevens, M. (2018).** *Power analysis and effect size in mixed effects models: A tutorial.* Journal of Cognition, 1(1), 9 — <https://doi.org/10.5334/joc.10>
- **DeBruine, L. M., & Barr, D. J. (2021).** *Understanding mixed-effects models through data simulation.* Advances in Methods and Practices in Psychological Science, 4(1). Simular datos con estructura mixta para entender el modelo y calcular potencia; materiales en OSF — <https://doi.org/10.1177/2515245920965119>
- Kumle, L., Võ, M. L.-H., & Draschkow, D. (2021). *Estimating power in (generalized) linear mixed models: An open introduction and tutorial in R.* Behavior Research Methods, 53, 2528-2543 — <https://doi.org/10.3758/s13428-021-01546-0>

---

## Para seguir después del curso

Dos caminos naturales cuando el modelo mixto frecuentista ya no sea un problema:

- **Análisis bayesiano con brms.** Bürkner, P.-C. (2017). *brms: An R package for Bayesian multilevel models using Stan.* Journal of Statistical Software, 80(1), 1-28. La misma sintaxis de fórmulas que `lme4`, con distribuciones a priori, incertidumbre sobre todos los parámetros y familias que `lme4` no cubre (ordinal, distribucional, no lineal) — <https://doi.org/10.18637/jss.v080.i01>
- **Modelos mixtos en Julia.** Alday, P., Kliegl, R., & Bates, D. (2026). *Embrace Uncertainty: Mixed-effects models with Julia.* Libro en línea. El paquete `MixedModels.jl`, del mismo autor que `lme4`, mucho más rápido: la opción cuando los datos o las simulaciones de potencia se hacen grandes — <https://embraceuncertaintybook.com/>

---

## Descargar el material y actualizarlo

El material se publica poco a poco a lo largo del curso. Hay tres formas de conseguirlo:

**1. Descargar todo en un ZIP (sin instalar nada).** Botón verde `Code` → `Download ZIP` y descomprímelo. Cuando haya material nuevo, descarga otra vez el ZIP y **descomprímelo en una carpeta nueva**: si lo descomprimes encima de la anterior, puedes sobrescribir tu trabajo.

**2. Descargar solo un archivo nuevo.** En GitHub, entra en el archivo y pulsa el botón de descarga (*Download raw file*). Guárdalo en la misma carpeta que tenías.

**3. Clonar el repositorio con git (recomendado).** Necesitas tener [git](https://git-scm.com/downloads) instalado. La primera vez, en la pestaña *Terminal* de RStudio (junto a *Console*; si no la ves: `Tools` → `Terminal` → `New Terminal`, o `Option + Shift + R` en Mac / `Alt + Shift + R` en Windows), entra en tu carpeta Documentos y clona el repositorio:

```bash
cd ~/Documents
git clone [POR DEFINIR: URL del repositorio final en la organización CIMCYC]
```

Cada vez que haya material nuevo, abre el proyecto del curso y escribe en la *Terminal*:

```bash
git pull
```

`git pull` descarga **solo lo que ha cambiado** desde la última vez.

> [!TIP]
> Para que `git pull` no choque con tus cambios, guarda tu trabajo con otro nombre: abre el script del día y usa `File` → `Save As`.

---

## Uso para estudiantes

[POR DEFINIR: cuando exista el proyecto de ejercicios]

---

## Nota sobre publicación del material

Los materiales se publican de forma progresiva para que los estudiantes no vean las soluciones antes de intentar los ejercicios por su cuenta:

- **Antes de cada sesión:** se publican las presentaciones en versión estudiante y los scripts de ejercicios
- **Después de cada sesión:** se publican las soluciones en la misma carpeta

---

## Financiación

Esta actividad es parte de la ayuda CEX2023-001312-M, financiada por MICIU/AEI/10.13039/501100011033 y ayuda UCE-PP2023-11 financiada por Universidad de Granada.

---

## Licencia

Materiales creados para uso docente en el programa María de Maeztu (MdM), CIMCYC, Universidad de Granada.
