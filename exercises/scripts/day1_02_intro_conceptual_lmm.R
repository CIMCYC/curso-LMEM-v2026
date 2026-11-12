# =============================================================================
# Introduccion conceptual a los modelos lineales mixtos
#
# El codigo del ejemplo con sleepstudy del documento
# day1_02_intro_conceptual_lmm.html, en el mismo orden y con los mismos nombres de
# objetos. Para ejecutarlo linea a linea en RStudio (Ctrl/Cmd + Enter)
# mientras se sigue el documento.
# =============================================================================

# install.packages(c("tidyverse", "lme4"))
library(tidyverse)
library(lme4)

options(scipen = 999, width = 120)  # sin notacion cientifica, consola ancha

# --- Los datos ---------------------------------------------------------------

# sleepstudy (Belenky et al., 2003) viene con lme4: 18 participantes, diez
# dias cada uno (Days, de 0 a 9) y el tiempo medio de reaccion de cada dia
# (Reaction, en ms)
data("sleepstudy", package = "lme4")
sleep <- as_tibble(sleepstudy)
print(sleep)


# Un panel por participante: cada uno empieza en un nivel distinto (su
# intercepto) y sube a un ritmo distinto (su pendiente)
sleep_plot <- ggplot(data = sleep, mapping = aes(x = Days, y = Reaction)) +
  geom_line() +
  geom_point() +
  facet_wrap(~ Subject, nrow = 3) +
  scale_x_continuous(breaks = c(0, 3, 6, 9))

sleep_plot

# =============================================================================
# Como leer la salida de lme4
# =============================================================================

# Ajustar el modelo de interceptos y pendientes variables: cada
# participante tiene su propio intercepto y su propia pendiente de los dias
sleep_model_slopes <- lmer(
  formula = Reaction ~ 1 + Days + (1 + Days | Subject),
  data = sleep
)
summary(sleep_model_slopes)

# ranef(): la desviacion de cada participante respecto al intercepto y a la
# pendiente de la poblacion (los u_j y los v_j)
ranef(sleep_model_slopes)

# coef(): el intercepto y la pendiente de cada participante, es decir, el
# efecto fijo mas su desviacion
coef(sleep_model_slopes)

# check assumptions
# performance::check_model(sleep_model_slopes)

sessionInfo()
