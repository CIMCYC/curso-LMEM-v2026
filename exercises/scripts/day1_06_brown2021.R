# =============================================================================
# Brown (2021): An Introduction to Linear Mixed-Effects Modeling in R
#
# Todo el codigo que acompana al articulo (intro_to_lmer.Rmd, en
# https://osf.io/v6qag/), en su mismo orden. Los nombres de los modelos llevan
# _ donde Brown pone un punto (rt_full_mod en vez de rt_full.mod).
# Percepcion del habla: 53 participantes repiten palabras que oyen solo con
# audio (Audio-only) o con audio y video de quien habla (Audiovisual), y a la
# vez responden a una tarea secundaria. RT es el tiempo de respuesta a esa
# tarea, en ms.
# Abrir antes el proyecto exercises.Rproj: here() busca los datos desde ahi.
#
# Dos avisos antes de empezar:
# - Brown uso lme4 1.1-26. Con versiones recientes (aqui, lme4 2.0.6) algunos
#   modelos ya no dan los avisos que ella describe. Cada comentario dice que
#   le paso a ella y que pasa ahora.
# - Varios modelos tardan (hasta un minuto y medio) y el script entero,
#   entre diez y veinte minutos. Por eso cada modelo lento se guarda con
#   saveRDS() en la carpeta output/ nada mas ajustarlo. Debajo
#   hay una linea con # que lo carga con readRDS(): si ya lo ajustaste otro
#   dia, salta el ajuste, quita el # y ejecuta esa linea.
# =============================================================================

# install.packages(c("tidyverse", "lme4", "here", "afex", "performance",
#                    "see"))
library(tidyverse)
library(lme4)
library(here)  # rutas desde la raiz del proyecto (exercises.Rproj)

# Brown carga tambien el paquete afex con library(). Aqui no se carga: sus
# funciones se llaman con afex:: delante. Asi summary() sigue ensenando la
# salida de lme4, igual que en los tutoriales (con afex cargado, summary()
# anade grados de libertad y p-valores).

options(scipen = 999, width = 120)  # sin notacion cientifica, consola ancha

# =============================================================================
# Los datos
# =============================================================================

# 1. Descargar los datos del repositorio OSF del articulo
#    (https://osf.io/v6qag/).
#    url      = la direccion de internet del archivo
#    destfile = donde se guarda en tu ordenador: en la carpeta
#               data/raw_data/ del proyecto, con el nombre rt_dummy_data.csv
#    Solo hace falta la primera vez. Si ya tienes el archivo, pon un #
#    delante de estas cuatro lineas para que no se vuelva a descargar.
download.file(
  url = "https://osf.io/download/53wc4/",
  destfile = here("data", "raw_data", "rt_dummy_data.csv")
)

# 2. Leer el archivo que acabamos de guardar.
#    PID = participante, stim = palabra, modality = condicion,
#    RT = tiempo de respuesta (ms)
rt_data <- read_csv(
  file = here("data", "raw_data", "rt_dummy_data.csv"),
  show_col_types = FALSE
)
print(rt_data)

# Cuantos participantes y cuantas palabras distintas hay
n_distinct(rt_data$PID)
n_distinct(rt_data$stim)

# La version agregada que usaria un ANOVA: una media por participante y
# modalidad. Se pierde la variabilidad entre palabras.
anova_data <- rt_data |>
  summarise(RT = mean(RT), .by = c(PID, modality))
head(anova_data)

# =============================================================================
# El efecto de la modalidad en el tiempo de respuesta
# =============================================================================

# Dummy coding, como en el articulo: Audio-only es la referencia (0) y
# Audiovisual es el 1
rt_data <- rt_data |>
  mutate(modality = if_else(modality == "Audio-only", 0, 1))

# --- El modelo completo ------------------------------------------------------

# Efecto fijo: la modalidad. Efectos aleatorios: cada participante (PID) y
# cada palabra (stim) tienen su propio intercepto y su propia pendiente de la
# modalidad. Aqui la pendiente por palabra se puede estimar porque cada
# palabra aparece en las dos modalidades.
# A Brown este modelo le dio un aviso de convergencia. Con lme4 2.0.6
# converge sin avisos.
rt_full_mod <- lmer(
  formula = RT ~ 1 + modality + (1 + modality | PID) + (1 + modality | stim),
  data = rt_data
)

# allFit() vuelve a ajustar el modelo con todos los optimizadores disponibles
# y dice con cuales funciona ([OK]). Brown usa all_fit() de afex, que ya no
# existe en las versiones recientes de afex: allFit() de lme4 hace lo mismo.
# Tarda unos 20 segundos.
rt_full_allfit <- allFit(object = rt_full_mod)
saveRDS(object = rt_full_allfit, file = here("output", "rt_full_allfit.rds"))
# rt_full_allfit <- readRDS(file = here("output", "rt_full_allfit.rds"))
rt_full_allfit

# El optimizador bobyqa funciona: control = lo fija
rt_full_mod <- lmer(
  formula = RT ~ 1 + modality + (1 + modality | PID) + (1 + modality | stim),
  data = rt_data,
  control = lmerControl(optimizer = "bobyqa")
)
saveRDS(object = rt_full_mod, file = here("output", "rt_full_mod.rds"))
# rt_full_mod <- readRDS(file = here("output", "rt_full_mod.rds"))

# --- El p-valor de la modalidad: test de razon de verosimilitudes ------------

# El modelo reducido es identico al completo salvo por el efecto fijo de la
# modalidad: misma estructura aleatoria y mismo optimizador
rt_reduced_mod <- lmer(
  formula = RT ~ 1 + (1 + modality | stim) + (1 + modality | PID),
  data = rt_data,
  control = lmerControl(optimizer = "bobyqa")
)
saveRDS(object = rt_reduced_mod, file = here("output", "rt_reduced_mod.rds"))
# rt_reduced_mod <- readRDS(file = here("output", "rt_reduced_mod.rds"))

# anova() vuelve a ajustar los dos modelos con REML = FALSE antes de
# compararlos (lo avisa en la consola)
anova(rt_reduced_mod, rt_full_mod)

# El mismo test con mixed() de afex, que ajusta por su cuenta el modelo
# completo y el reducido. Es mas comodo cuando hay varios efectos fijos.
# Tarda alrededor de medio minuto.
rt_mixed_lrt <- afex::mixed(
  formula = RT ~ 1 + modality + (1 + modality | PID) + (1 + modality | stim),
  data = rt_data,
  control = lmerControl(optimizer = "bobyqa"),
  method = "LRT"
)
saveRDS(object = rt_mixed_lrt, file = here("output", "rt_mixed_lrt.rds"))
# rt_mixed_lrt <- readRDS(file = here("output", "rt_mixed_lrt.rds"))
rt_mixed_lrt

# --- Leer la salida ----------------------------------------------------------

# El coeficiente de modality es 83.18: en estos datos se responde unos 83 ms
# mas despacio en la condicion audiovisual que en la de solo audio
summary(rt_full_mod)

# Los intervalos de confianza de las desviaciones tipicas y de las
# correlaciones de los efectos aleatorios (una nota al pie del articulo).
# OJO: con estos datos tarda mas de 20 minutos, por eso va con # delante.
# rt_full_confint <- confint(
#   object = rt_full_mod, parm = "theta_", oldNames = FALSE
# )

# coef(): el efecto fijo mas la desviacion de cada palabra ($stim) y de cada
# participante ($PID)
coef(rt_full_mod)

performance::check_model(rt_reduced_mod)

# =============================================================================
# La interaccion entre modalidad y SNR
# =============================================================================

# Los mismos datos con una columna mas: SNR (signal-to-noise ratio), la
# relacion entre la voz y el ruido de fondo, Easy o Hard.
# Solo hace falta descargarlo la primera vez (ver arriba).
download.file(
  url = "https://osf.io/download/vkfzn/",
  destfile = here("data", "raw_data", "rt_dummy_data_interaction.csv")
)

rt_data_interaction <- read_csv(
  file = here("data", "raw_data", "rt_dummy_data_interaction.csv"),
  show_col_types = FALSE
)

# Dummy coding: Audio-only y Easy son las referencias (0)
rt_data_interaction <- rt_data_interaction |>
  mutate(
    modality = if_else(modality == "Audio-only", 0, 1),
    SNR = if_else(SNR == "Easy", 0, 1)
  )

# --- 1. El modelo con todas las pendientes -----------------------------------

# Todas las pendientes por participante y por palabra, menos la de la
# interaccion: una estructura tan compleja casi seguro que da problemas de
# estimacion y habria que simplificarla de todas formas (Matuschek et al.,
# 2017).
# Sale singular, a Brown y ahora. Tarda unos 15 segundos.
rt_int_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (1 + modality + SNR | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction
)
saveRDS(object = rt_int_mod, file = here("output", "rt_int_mod_1.rds"))
# rt_int_mod <- readRDS(file = here("output", "rt_int_mod_1.rds"))

# Con ningun optimizador deja de ser singular. Tarda alrededor de un minuto.
rt_int_allfit_1 <- allFit(object = rt_int_mod)
saveRDS(object = rt_int_allfit_1, file = here("output", "rt_int_allfit_1.rds"))
# rt_int_allfit_1 <- readRDS(file = here("output", "rt_int_allfit_1.rds"))
rt_int_allfit_1

# --- 2. Quitar una pendiente por palabra -------------------------------------

# El problema viene de los efectos aleatorios por palabra, que aportan muy
# poca varianza. Se prueba a quitar la pendiente por palabra de la modalidad
# o la de SNR, y se compara cada modelo con el completo. refit = FALSE porque
# aqui se comparan efectos aleatorios, no fijos: no hay que volver a ajustar
# con REML = FALSE.
rt_int_no_modality_stim_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (1 + SNR | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction
)
rt_int_no_snr_stim_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (1 + modality | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction
)
saveRDS(object = rt_int_no_modality_stim_mod,
        file = here("output", "rt_int_no_modality_stim_mod.rds"))
saveRDS(object = rt_int_no_snr_stim_mod,
        file = here("output", "rt_int_no_snr_stim_mod.rds"))
# rt_int_no_modality_stim_mod <- readRDS(
#   file = here("output", "rt_int_no_modality_stim_mod.rds")
# )
# rt_int_no_snr_stim_mod <- readRDS(
#   file = here("output", "rt_int_no_snr_stim_mod.rds")
# )

anova(rt_int_no_modality_stim_mod, rt_int_mod, refit = FALSE)
anova(rt_int_no_snr_stim_mod, rt_int_mod, refit = FALSE)

# Ninguno de los dos modelos reducidos difiere del completo. Se quita la
# pendiente que menos varianza aporta, la de SNR por palabra.
# A Brown este modelo le salio singular. Con lme4 2.0.6 el ajuste por
# defecto no da el aviso, pero el allFit() de abajo ensena que con cuatro
# de los cinco optimizadores si sale singular: el problema sigue ahi.
rt_int_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (1 + modality | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction
)
saveRDS(object = rt_int_mod, file = here("output", "rt_int_mod_2.rds"))
# rt_int_mod <- readRDS(file = here("output", "rt_int_mod_2.rds"))

# Tarda alrededor de un minuto
rt_int_allfit_2 <- allFit(object = rt_int_mod)
saveRDS(object = rt_int_allfit_2, file = here("output", "rt_int_allfit_2.rds"))
# rt_int_allfit_2 <- readRDS(file = here("output", "rt_int_allfit_2.rds"))
rt_int_allfit_2

# Brown prueba el optimizador Nelder-Mead, que le dio problemas de
# convergencia. Con lme4 2.0.6 converge sin avisos. Tarda alrededor de un
# minuto y medio.
rt_int_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (1 + modality | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction,
  control = lmerControl(optimizer = "Nelder_Mead")
)
saveRDS(object = rt_int_mod, file = here("output", "rt_int_mod_3.rds"))
# rt_int_mod <- readRDS(file = here("output", "rt_int_mod_3.rds"))

# --- 3. Quitar la correlacion por palabra ------------------------------------

# Como ningun optimizador le funcionaba, Brown quita la correlacion entre el
# intercepto y la pendiente de la modalidad por palabra (no interesa en si):
# (0 + modality | stim) es la pendiente sin intercepto y (1 | stim) el
# intercepto por separado.
# A Brown le dio un aviso de convergencia. Con lme4 2.0.6 no, y el allFit()
# de abajo funciona con los cinco optimizadores.
rt_int_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (0 + modality | stim) + (1 | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction
)
saveRDS(object = rt_int_mod, file = here("output", "rt_int_mod_4.rds"))
# rt_int_mod <- readRDS(file = here("output", "rt_int_mod_4.rds"))

# Tarda alrededor de un minuto
rt_int_allfit_3 <- allFit(object = rt_int_mod)
saveRDS(object = rt_int_allfit_3, file = here("output", "rt_int_allfit_3.rds"))
# rt_int_allfit_3 <- readRDS(file = here("output", "rt_int_allfit_3.rds"))
rt_int_allfit_3

# --- 4. El modelo final ------------------------------------------------------

# Con bobyqa converge. Es el modelo con el que se queda Brown.
rt_int_mod <- lmer(
  formula = RT ~ 1 + modality + SNR + modality:SNR +
    (0 + modality | stim) + (1 | stim) + (1 + modality + SNR | PID),
  data = rt_data_interaction,
  control = lmerControl(optimizer = "bobyqa")
)
saveRDS(object = rt_int_mod, file = here("output", "rt_int_mod_5.rds"))
# rt_int_mod <- readRDS(file = here("output", "rt_int_mod_5.rds"))

# Mirar siempre los efectos aleatorios para comprobar que la estimacion ha
# ido bien: ninguna varianza en 0 y ninguna correlacion en 1 o -1
summary(rt_int_mod)

# =============================================================================
# El efecto de la modalidad en la inteligibilidad (variable binaria)
# =============================================================================

# acc = 1 si el participante identifico bien la palabra, 0 si no.
# Solo hace falta descargarlo la primera vez (ver arriba).
download.file(
  url = "https://osf.io/download/rym4k/",
  destfile = here("data", "raw_data", "acc_dummy_data.csv")
)

acc_data <- read_csv(
  file = here("data", "raw_data", "acc_dummy_data.csv"),
  show_col_types = FALSE
)

# Dummy coding con Audio-only de referencia; PID y stim pasan a factor
acc_data <- acc_data |>
  mutate(
    modality = if_else(modality == "Audio-only", 0, 1),
    PID = as.factor(PID),
    stim = as.factor(stim)
  )

# Con una variable dependiente de 0 y 1 no vale lmer(): se usa glmer() con
# family = binomial (un modelo mixto generalizado, lo veremos mas adelante).
# Tarda algo menos de un minuto.
acc_full_mod <- glmer(
  formula = acc ~ 1 + modality + (1 + modality | PID) + (1 + modality | stim),
  data = acc_data,
  family = binomial
)
saveRDS(object = acc_full_mod, file = here("output", "acc_full_mod.rds"))
# acc_full_mod <- readRDS(file = here("output", "acc_full_mod.rds"))

# Comprobar los efectos aleatorios
summary(acc_full_mod)

# El modelo reducido, sin el efecto fijo de la modalidad.
# Tarda alrededor de un minuto y medio.
acc_reduced_mod <- glmer(
  formula = acc ~ 1 + (1 + modality | PID) + (1 + modality | stim),
  data = acc_data,
  family = binomial
)
saveRDS(object = acc_reduced_mod, file = here("output", "acc_reduced_mod.rds"))
# acc_reduced_mod <- readRDS(file = here("output", "acc_reduced_mod.rds"))

# Test de razon de verosimilitudes del efecto de la modalidad
anova(acc_reduced_mod, acc_full_mod)

sessionInfo()
