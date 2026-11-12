# =============================================================================
# Introduccion a modelos lineales
#
# El codigo de los ejemplos del documento day1_01_winter2013_tutorial1.html, en el
# mismo orden y con los mismos nombres de objetos. Para ejecutarlo linea a
# linea en RStudio (Ctrl/Cmd + Enter) mientras se sigue el documento.
# =============================================================================

# install.packages(c("tidyverse", "performance", "see"))
library(tidyverse)
library(see)  # dibuja los graficos de performance::check_model()

options(scipen = 999, width = 120)  # sin notacion cientifica, consola ancha

# =============================================================================
# La idea en una ecuacion
# =============================================================================

# Doce palabras espanolas con frecuencia y tiempo de respuesta INVENTADOS
# (verosimiles, construidos para el ejemplo; no son datos de un experimento)
palabras <- tibble(
  palabra = c("tiempo", "casa", "agua", "mesa", "perro", "nube",
              "lampara", "cebolla", "efimero", "albornoz", "zozobra",
              "alfeizar"),
  # frecuencia por millon de palabras; RT = tiempo de respuesta en ms
  frecuencia = c(1200, 900, 600, 150, 120, 40, 20, 10, 5, 3, 2, 1.2),
  RT = c(629, 584, 638, 636, 719, 702, 791, 720, 854, 777, 846, 799)
) |>
  mutate(log_frec = log10(frecuencia))  # la frecuencia en logaritmo de base 10
print(palabras)

# La recta que ajusta lm(): el intercepto (alpha) y la pendiente (beta)
model_pal <- lm(formula = RT ~ log_frec, data = palabras)
summary(model_pal)
coef(model_pal)

# =============================================================================
# Mas ejemplos: Winter (2013)
# =============================================================================

# --- Tono de voz en funcion del sexo -----------------------------------------

pitch_sex <- tibble(
  sex   = c(rep("female", 3), rep("male", 3)),
  pitch = c(233, 204, 242, 130, 112, 142)
)
print(pitch_sex)

model_sex <- lm(formula = pitch ~ sex, data = pitch_sex)
summary(model_sex)

# La media del tono en cada grupo: agrupar por sexo y resumir
pitch_means <- pitch_sex |>
  group_by(sex) |>
  summarise(mean_pitch = mean(pitch))
pitch_means

# --- Por que 0 = mujer y 1 = hombre ------------------------------------------

# factor() ordena los niveles alfabeticamente;
# el primero es la referencia (el 0)
pitch_sex <- pitch_sex |>
  mutate(sex = factor(sex))
levels(pitch_sex$sex)

model_female_ref <- lm(formula = pitch ~ sex, data = pitch_sex)
coef(model_female_ref)

# levels = fija el orden de los niveles: male primero, asi male es el 0
pitch_sex <- pitch_sex |>
  mutate(sex = factor(sex, levels = c("male", "female")))
levels(pitch_sex$sex)

model_male_ref <- lm(formula = pitch ~ sex, data = pitch_sex)
coef(model_male_ref)

# deviation coding: cada grupo a media unidad del 0
pitch_sex <- pitch_sex |>
  mutate(sex_dev = if_else(sex == "female", -0.5, 0.5))

model_sex_dev <- lm(formula = pitch ~ sex_dev, data = pitch_sex)
coef(model_sex_dev)

# --- Tono de voz en funcion de la edad ---------------------------------------

pitch_age <- tibble(
  age   = c(14, 23, 35, 48, 52, 67),
  pitch = c(252, 244, 240, 233, 212, 204)
)
print(pitch_age)

model_age <- lm(formula = pitch ~ age, data = pitch_age)
summary(model_age)

# --- Centrar el predictor ----------------------------------------------------

# Con la edad en anos, el intercepto es el tono a la edad 0
coef(model_age)

# Edad centrada: a cada edad se le resta la edad media, asi el 0 es la edad
# media y el intercepto es el tono a esa edad
pitch_age <- pitch_age |>
  mutate(age_c = age - mean(age))

model_age_c <- lm(formula = pitch ~ age_c, data = pitch_age)
summary(model_age_c)

# =============================================================================
# Supuestos del modelo lineal
# =============================================================================

# Simulamos 200 palabras con la recta de las doce del principio:

# alpha = 843 
# beta = -76
# error normal con sigma = 40.

# Como los datos son simulados, sabemos que cumplen los supuestos: las
# comprobaciones de abajo ensenan como se ve un modelo que los cumple.
set.seed(2026)  # para que la simulacion salga igual cada vez

palabras_sim <- tibble(
  # la frecuencia (log10) de cada palabra, al azar entre 0 y 3.5
  log_frec = runif(n = 200, min = 0, max = 3.5)
) |>
  mutate(
    # la recta (alpha + beta * x) mas el error (normal, sigma = 40)
    RT = 843 - 76 * log_frec + rnorm(n = 200, mean = 0, sd = 40)
  )

# Visualiza lo que hace la función runif y rnorm 
hist(runif(n = 200, min = 0, max = 3.5))
hist(rnorm(n = 200, mean = 0, sd = 40))

# El modelo sobre las 200 palabras: coef() recupera alpha y beta
model_sim <- lm(formula = RT ~ log_frec, data = palabras_sim)
coef(model_sim)

performance::check_model(model_sim)

sessionInfo()


