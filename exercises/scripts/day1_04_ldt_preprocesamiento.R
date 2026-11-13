# =============================================================================
# Tarea de decision lexica: preprocesamiento (de JATOS a datos limpios)
#
# Este script se ejecuta entero, sin tocar nada: con el boton Source de
# RStudio, o automaticamente desde el documento de analisis (day1_05), que
# lo llama con source().
# Abrir antes el proyecto exercises.Rproj: here() busca los datos desde ahi.
#
# Entrada: el archivo de resultados que exporta JATOS, en data/raw_data/
# (jatos_results_*.txt; si hay varios, se usa el mas reciente).
# Salida: data/processed_data/ldt_rt.csv, con los ensayos validos para
# analizar el tiempo de respuesta.
# =============================================================================

# install.packages(c("tidyverse", "jsonlite", "here"))
library(tidyverse)
library(jsonlite)  # lee el formato JSON en el que JATOS guarda los datos
library(here)      # rutas desde la raiz del proyecto (exercises.Rproj)

options(scipen = 999)  # sin notacion cientifica

# =============================================================================
# 1. Leer el archivo de JATOS
# =============================================================================

# El export de JATOS mas reciente de data/raw_data/
candidates <- list.files(
  path = here("data", "raw_data"),
  pattern = "^jatos_results_.*\\.txt$",
  full.names = TRUE
)
if (length(candidates) == 0) {
  stop("No hay ningun archivo jatos_results_*.txt en data/raw_data/")
}
jatos_file <- candidates[which.max(file.mtime(candidates))]
print(paste("Archivo de JATOS:", basename(jatos_file)))

# Cada sesion completa es una linea con un objeto JSON {"data":
# [...ensayos...], "context": {...}}. Las sesiones que no se terminaron
# dejan lineas sueltas (un "[", o sus ensayos de practica, uno por linea)
# o un "data" vacio: se descartan. Solo se leen las lineas que empiezan
# por {"data".
raw_lines <- read_lines(jatos_file)
json_lines <- raw_lines[str_starts(raw_lines, fixed("{\"data\""))]

sessions <- map(json_lines, \(line) fromJSON(line, simplifyVector = TRUE))
sessions <- keep(sessions, \(s) is.data.frame(s$data) && nrow(s$data) > 0)

# Una tabla con todos los ensayos. sesion_jatos (jatosStudyResultId) solo
# sirve para separar a los participantes: en los datos que se guardan cada
# uno lleva una etiqueta anonima (P01, P02, ...).
trials_raw <- map(sessions, \(s) {
  s$data |>
    select(ESTIM, condition, WF, SF, response, correct, response_time) |>
    mutate(sesion_jatos = s$context$jatosStudyResultId)
}) |>
  list_rbind() |>  # une las tablas de todos los participantes en una sola
  as_tibble()

# =============================================================================
# 2. Variables con nombres claros
# =============================================================================

# condition: "np" = pseudopalabra; aa, ab, ba, bb = palabra.
# WF = frecuencia de la palabra, SF = frecuencia silabica; a = alta, b = baja.
# Tecla M = palabra, tecla Z = pseudopalabra. response_time en ms.
d <- trials_raw |>
  mutate(
    participante = paste0("P", str_pad(as.integer(factor(sesion_jatos)), 2,
                                       pad = "0")),
    estimulo = ESTIM,
    tipo = if_else(condition == "np", "pseudopalabra", "palabra"),
    frecuencia_palabra = case_when(WF == "a" ~ "alta", WF == "b" ~ "baja"),
    frecuencia_silabica = case_when(SF == "a" ~ "alta", SF == "b" ~ "baja"),
    respuesta = na_if(as.character(response), "None"),
    correcto = as.integer(correct),
    RT = as.numeric(response_time)
  ) |>
  select(participante, estimulo, tipo, frecuencia_palabra,
         frecuencia_silabica, respuesta, correcto, RT)

# =============================================================================
# 3. Participantes: la precision de cada persona
# =============================================================================

# La proporcion de respuestas correctas de cada participante, en todos sus
# ensayos (palabras y pseudopalabras). Quien responde al azar ronda el 0.50.
accuracy_by_participant <- d |>
  summarise(
    n_trials = n(),             # cuantos ensayos hizo
    accuracy = mean(correcto),  # la media de 0 y 1 es la proporcion de aciertos
    .by = participante
  ) |>
  arrange(accuracy)             # de menor a mayor precision
print(accuracy_by_participant, n = Inf)

# Nos quedamos con quien acierta al menos el 80 % de los ensayos
min_accuracy <- 0.80
good_participants <- accuracy_by_participant |>
  filter(accuracy >= min_accuracy)

d_good <- d |>
  filter(participante %in% good_participants$participante)

# =============================================================================
# 4. Ensayos: palabras, aciertos, anticipaciones y tiempos extremos
# =============================================================================

# Solo las palabras: las pseudopalabras no tienen frecuencia
words <- d_good |>
  filter(tipo == "palabra")

# errors with and without
errors_with <- words |> filter(correcto == 0)
errors_without <- words |> filter(correcto == 1)

# Una respuesta en menos de 250 ms es una tecla pulsada antes de leer
# anticipations with and without
anticipations_with <- errors_without |> filter(RT < 250)
anticipations_without <- errors_without |> filter(RT >= 250)

# classify outliers: 3 standard deviations from individual means.
# Para cada participante (.by) se calculan su media y su desviacion tipica, y
# se marca con un 1 el ensayo que queda a mas de 3 desviaciones tipicas
sd_limit <- 3

anticipations_without <- anticipations_without |>
  mutate(
    outlier = if_else(RT < mean(RT) - sd_limit * sd(RT) |
                        RT > mean(RT) + sd_limit * sd(RT), 1, 0),
    .by = participante
  )

# outliers with and without
outliers_with <- anticipations_without |> filter(outlier == 1)
outliers_without <- anticipations_without |> filter(outlier != 1)

# Cuantos participantes y cuantos ensayos quedan despues de cada paso
steps <- tibble(
  paso = c("todos los ensayos",
           "participantes con precision >= 80 %",
           "solo palabras",
           "sin errores",
           "sin anticipaciones (RT < 250 ms)",
           "sin tiempos extremos (3 DT por participante)"),
  participantes = c(n_distinct(d$participante),
                    n_distinct(d_good$participante),
                    n_distinct(words$participante),
                    n_distinct(errors_without$participante),
                    n_distinct(anticipations_without$participante),
                    n_distinct(outliers_without$participante)),
  ensayos = c(nrow(d), nrow(d_good), nrow(words), nrow(errors_without),
              nrow(anticipations_without), nrow(outliers_without))
)
print(steps)

# =============================================================================
# 5. Verificacion por participante
# =============================================================================

# --- Tabla: errores, outliers y datos que quedan, por participante -----------

# Cuantas palabras ve cada participante: sobre ese numero se calculan los %
trials_per_subject <- nrow(words) / n_distinct(words$participante)

# % de errores de cada participante
t1 <- errors_with |>
  summarise(
    perc_errors = round(n() / trials_per_subject * 100, 2),
    .by = participante
  )

# % de outliers de cada participante
t2 <- outliers_with |>
  summarise(
    perc_outliers = round(n() / trials_per_subject * 100, 2),
    .by = participante
  )

# % de datos que quedan, con su mediana, su media y su desviacion tipica
t3 <- outliers_without |>
  summarise(
    perc_left = round(n() / trials_per_subject * 100, 2),
    median_RT = round(median(RT), 2),
    mean_RT = round(mean(RT), 2),
    sd_RT = round(sd(RT), 2),
    .by = participante
  )

# Las tres tablas juntas. Quien no tiene errores o no tiene outliers no
# aparece en t1 o en t2 y se queda con NA: se cambia por un 0.
participant_summary <- t1 |>
  full_join(t2, by = join_by(participante)) |>
  full_join(t3, by = join_by(participante)) |>
  arrange(participante) |>
  mutate(
    perc_errors = if_else(is.na(perc_errors), 0, perc_errors),
    perc_outliers = if_else(is.na(perc_outliers), 0, perc_outliers)
  )
print(participant_summary, n = Inf)

# --- Grafico: los outliers de cada participante ------------------------------

# Una caja por participante con los datos que quedan y, en rojo, los ensayos
# que se han quitado por outliers. reorder() ordena a los participantes por
# su RT medio.
outliers_plot <- ggplot() +
  geom_boxplot(
    data = outliers_without,
    mapping = aes(x = reorder(participante, -RT), y = RT),
    outlier.shape = NA,  # sin los puntos extremos que pone el boxplot
    width = 0.5
  ) +
  geom_point(
    data = outliers_with,
    mapping = aes(x = reorder(participante, -RT), y = RT),
    color = "red", alpha = 0.6, size = 2
  ) +
  coord_flip() +  # participantes en vertical, RT en horizontal
  labs(
    title = "Outliers por participante",
    subtitle = paste("Puntos rojos = outliers.",
                     "Orden: de menor (arriba) a mayor (abajo) RT medio."),
    x = "Participante",
    y = "RT (ms)"
  ) +
  theme_minimal() +
  theme(axis.text.y = element_text(size = 8))
print(outliers_plot)

# =============================================================================
# 6. Guardar
# =============================================================================

# write_excel_csv: UTF-8 con BOM, para que Excel muestre bien las tildes
dir.create(here("data", "processed_data"), showWarnings = FALSE)
write_excel_csv(
  x = select(outliers_without, -outlier),
  file = here("data", "processed_data", "ldt_rt.csv")
)
print("Guardado: data/processed_data/ldt_rt.csv")

sessionInfo()
