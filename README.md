# Introducción a los modelos lineales mixtos (LMEM)

**[Página web del curso](https://cimcyc.ugr.es/formacion/portal-formacion/curso-lmem-v2026)**

**Autor:** Filip Andras — CIMCYC, Universidad de Granada  
**Edición:** noviembre-diciembre de 2026  
**Duración:** 20 horas presenciales, en 4 sesiones: viernes 13 y 27 de noviembre y 4 y 11 de diciembre de 2026

---

## Estructura del curso


| Sesión | Tema |
|--------|------|
| **Día 1** (13 nov) | Del modelo lineal a los modelos lineales mixtos: supuestos, efectos fijos y aleatorios, sintaxis en R |
| **Día 2** (27 nov) | Estructura de efectos aleatorios: singularidad, convergencia, *keep it maximal* vs. modelos parsimoniosos |
| **Día 3** (4 dic) | Codificación de contrastes e introducción a los modelos lineales generalizados |
| **Día 4** (11 dic) | Simulación de datos y análisis de potencia para modelos mixtos |

---


## Lecturas recomendadas


### Día 1 — Del modelo lineal a los modelos lineales mixtos

- **Winter, B. (2013).** *Linear models and linear mixed effects models in R with linguistic applications.* <https://arxiv.org/abs/1308.5499> 
	- Dos tutoriales cortos y accesibles para personas con poca o muy poca experiencia con LMEM.
- **Brown, V. A. (2021).** *An introduction to linear mixed-effects modeling in R.* Advances in Methods and Practices in Psychological Science, 4(1). <https://doi.org/10.1177/2515245920960351>
	- Introducción conceptual y práctica a LMEM, con datos y código en OSF.


### Día 2 — Estructura de efectos aleatorios

- **Barr, D. J., Levy, R., Scheepers, C., & Tily, H. J. (2013).** *Random effects structure for confirmatory hypothesis testing: Keep it maximal.* Journal of Memory and Language, 68(3), 255-278 <https://doi.org/10.1016/j.jml.2012.11.001>
- **Bates, D., Kliegl, R., Vasishth, S., & Baayen, H. (2015).** *Parsimonious mixed models.*  <https://arxiv.org/abs/1506.04967>
	- La respuesta a Barr et al.: por qué los modelos maximales no convergen y cómo simplificarlos.


### Día 3 — Codificación de contrastes y modelos lineales generalizados

- **Schad, D. J., Vasishth, S., Hohenstein, S., & Kliegl, R. (2020).** *How to capitalize on a priori contrasts in linear (mixed) models: A tutorial.* Journal of Memory and Language, 110, 104038 <https://doi.org/10.1016/j.jml.2019.104038>
- **Winter, B. (2019).** *Statistics for Linguists: An Introduction Using R.* Routledge.  <https://doi.org/10.4324/9781315165547>
	- Capítulos de modelos lineales generalizados (regresión logística y de Poisson).


### Día 4 — Simulación de datos y análisis de potencia


- **DeBruine, L. M., & Barr, D. J. (2021).** *Understanding mixed-effects models through data simulation.* Advances in Methods and Practices in Psychological Science, 4(1). <https://doi.org/10.1177/2515245920965119>
	- Simular datos con estructura mixta para entender el modelo y calcular potencia; materiales en OSF.


---

## Para seguir después del curso


- **Análisis bayesiano con brms:** Bürkner, P.-C. (2017). *brms: An R package for Bayesian multilevel models using Stan.* Journal of Statistical Software, 80(1), 1-28.  <https://doi.org/10.18637/jss.v080.i01>
	- La misma sintaxis de fórmulas que `lme4`, con distribuciones a priori, incertidumbre sobre todos los parámetros y familias que `lme4` no cubre.
- **Modelos mixtos en Julia:** Alday, P., Kliegl, R., & Bates, D. (2026). *Embrace Uncertainty: Mixed-effects models with Julia.*  <https://embraceuncertaintybook.com/>
	- Libro-tutorial online. El paquete `MixedModels.jl`, del mismo autor que `lme4`, mucho más rápido: la opción cuando los datos o las simulaciones de potencia se hacen grandes.

---

## Descargar el material y actualizarlo

El material se publica poco a poco a lo largo del curso, se puede descargar de la siguiente forma:

**1. Descargar todo en un ZIP (sin instalar nada).** Botón verde `Code` → `Download ZIP` y descomprímelo. Cuando haya material nuevo, descarga otra vez el ZIP y **descomprímelo en una carpeta nueva**: si lo descomprimes encima de la anterior, puedes sobrescribir tu trabajo.

**2. Descargar solo un archivo nuevo.** En GitHub, entra en el archivo y pulsa el botón de descarga (*Download raw file*). Guárdalo en la misma carpeta que tenías.

**3. Clonar el repositorio con git.** Necesitas tener [git](https://git-scm.com/downloads) instalado. 


---

## Financiación

Esta actividad es parte de la ayuda CEX2023-001312-M, financiada por MICIU/AEI/10.13039/501100011033 y ayuda UCE-PP2023-11 financiada por Universidad de Granada.


