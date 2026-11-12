# =============================================================================
# Winter (2013), Tutorial 2: el modelo lineal mixto
#
# El codigo de los ejemplos del documento day1_03_winter2013_tutorial2.html, en el
# mismo orden y con los mismos nombres de objetos. Para ejecutarlo linea a
# linea en RStudio (Ctrl/Cmd + Enter) mientras se sigue el documento.
# Abrir antes el proyecto exercises.Rproj: here() busca los datos desde ahi.
# =============================================================================

# install.packages(c("tidyverse", "lme4", "here", "performance", "see",
#                    "ggeffects"))
library(tidyverse)
library(lme4)
library(here)  # rutas desde la raiz del proyecto (exercises.Rproj)

options(scipen = 999, width = 120)  # sin notacion cientifica, consola ancha

# =============================================================================
# Conocer los datos
# =============================================================================

# 1. Descargar los datos de la web de Winter.
#    url      = la direccion de internet del archivo
#    destfile = donde se guarda en tu ordenador: en la carpeta
#               data/raw_data/ del proyecto, con el nombre politeness_data.csv
#    Solo hace falta la primera vez. Si ya tienes el archivo, pon un #
#    delante de estas cuatro lineas para que no se vuelva a descargar.
download.file(
  url = "http://www.bodowinter.com/tutorial/politeness_data.csv",
  destfile = here("data", "raw_data", "politeness_data.csv")
)

# 2. Leer el archivo que acabamos de guardar.
#    En el archivo, el tono de voz (Hz) se llama frequency: rename() le
#    cambia el nombre a pitch, como en el tutorial 1
politeness <- read_csv(
  file = here("data", "raw_data", "politeness_data.csv"),
  show_col_types = FALSE
) |>
  rename(pitch = frequency)
print(politeness)

# Cuantas respuestas hay de cada hablante en cada escenario
xtabs(formula = ~ subject + scenario, data = politeness)

# =============================================================================
# Interceptos variables por hablante y por escenario
# =============================================================================

politeness_model <- lmer(
  formula = pitch ~ attitude + (1 | subject) + (1 | scenario),
  data = politeness
)
summary(politeness_model)

# =============================================================================
# Anadir el genero como efecto fijo
# =============================================================================

politeness_model_gender <- lmer(
  formula = pitch ~ attitude + gender +
    (1 | subject) + (1 | scenario),
  data = politeness
)
summary(politeness_model_gender)

# Las desviaciones tipicas de los efectos aleatorios, sin y con el genero
VarCorr(politeness_model)
VarCorr(politeness_model_gender)

# Predicciones del modelo para cada combinacion de genero y actitud
gender_predictions <- ggeffects::ggpredict(
  model = politeness_model_gender,
  terms = c("gender", "attitude")
)
plot(gender_predictions)

# =============================================================================
# El p-valor de la actitud: test de razon de verosimilitudes
# (likelihood ratio test)
# =============================================================================

# Para comparar dos modelos con anova(): REML = FALSE en los dos y la misma
# estructura aleatoria. El modelo nulo no lleva la actitud, el completo si.
politeness_null_ml <- lmer(
  formula = pitch ~ gender +
    (1 | subject) + (1 | scenario),
  data = politeness, REML = FALSE
)
politeness_model_ml <- lmer(
  formula = pitch ~ attitude + gender +
    (1 | subject) + (1 | scenario),
  data = politeness, REML = FALSE
)

# Likelihood Ratio Test (LRT)
anova(politeness_null_ml, politeness_model_ml)

# Los coeficientes del modelo completo
coef(summary(politeness_model_ml))

# =============================================================================
# Pendientes variables
# =============================================================================

# La pendiente de la actitud varia por hablante y por escenario. R avisa:
# "boundary (singular) fit"
politeness_model_slopes <- lmer(
  formula = pitch ~ attitude + gender +
    (1 + attitude | subject) + (1 + attitude | scenario),
  data = politeness, REML = FALSE
)
summary(politeness_model_slopes)

# TRUE = modelo degenerado (singular)
isSingular(politeness_model_slopes)

# =============================================================================
# Supuestos del modelo mixto
# =============================================================================

performance::check_model(politeness_model_slopes)

# =============================================================================
# Como redactarlo
# =============================================================================

# La referencia de lme4 para citarla en el articulo
citation("lme4")

sessionInfo()
