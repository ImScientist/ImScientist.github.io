(() => {
  const POSITIVE_COLORS = ["#6e44ff", "#8f5eff", "#b07bff", "#d2a0ff"];
  const NEGATIVE_COLORS = ["#008585", "#179b9b", "#38b2ac", "#78dcca"];

  function formatRatioLabel(ratioKey) {
    return Number.parseFloat(ratioKey).toString();
  }

  function createOption(value, selectedValue) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = formatRatioLabel(value);
    option.selected = value === selectedValue;
    return option;
  }

  function populateRatioSelect(selectElement, ratios, selectedValue) {
    selectElement.replaceChildren(...ratios.map((ratio) => createOption(ratio, selectedValue)));
  }

  function buildDensityFigure(curves, colors) {
    return {
      data: curves.map((curve, index) => ({
        x: curve.x,
        y: curve.y,
        type: "scatter",
        mode: "lines",
        name: `pod ${index + 1}`,
        line: {
          color: colors[index % colors.length],
          width: 3,
          shape: "spline",
          smoothing: 1.25,
        },
        marker: {
          color: colors[index % colors.length],
        },
        hovertemplate: "Score %{x:.2f}<br>Density %{y:.4f}<extra></extra>",
      })),
      layout: {
        xaxis: {
          title: "Score",
          showgrid: false,
          zeroline: false,
          showline: true,
          linecolor: "#5f6c80",
          linewidth: 1,
        },
        yaxis: {
          title: "Density",
          showgrid: false,
          zeroline: false,
          showline: true,
          linecolor: "#5f6c80",
          linewidth: 1,
        },
        legend: {
          x: 0.99,
          y: 0.99,
          xanchor: "right",
          yanchor: "top",
        },
        margin: { t: 24, r: 24, b: 56, l: 56 },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
      },
    };
  }

  function getElements(root) {
    return {
      status: root.querySelector('[data-role="status"]'),
      shell: root.querySelector('[data-role="shell"]'),
      positiveRatio: root.querySelector('[data-role="positive-ratio"]'),
      negativeRatio: root.querySelector('[data-role="negative-ratio"]'),
      globalScore: root.querySelector('[data-role="global-score"]'),
      meanScore: root.querySelector('[data-role="mean-score"]'),
      podScores: root.querySelector('[data-role="pod-scores"]'),
      positiveChart: root.querySelector('[data-role="positive-chart"]'),
      negativeChart: root.querySelector('[data-role="negative-chart"]'),
    };
  }

  function setStatus(elements, message, isError = false) {
    if (!elements.status) {
      return;
    }

    elements.status.textContent = message;
    elements.status.hidden = false;
    elements.status.classList.toggle("is-error", isError);
  }

  function showShell(elements) {
    if (elements.status) {
      elements.status.hidden = true;
    }
    if (elements.shell) {
      elements.shell.hidden = false;
    }
  }

  function showError(elements, message) {
    if (elements.shell) {
      elements.shell.hidden = true;
    }
    setStatus(elements, message, true);
  }

  function updateMetricList(elements, values) {
    const items = values.map((value, index) => {
      const item = document.createElement("li");
      item.textContent = `pod ${index + 1}: ${value}`;
      return item;
    });
    elements.podScores.replaceChildren(...items);
  }

  function renderCharts(root) {
    const elements = getElements(root);
    const content = root.__fraeContent;
    const positiveKey = elements.positiveRatio.value;
    const negativeKey = elements.negativeRatio.value;
    const scoreKey = `${positiveKey}_${negativeKey}`;

    const positiveCurves = content.positive_groups[positiveKey]?.curves;
    const negativeCurves = content.negative_groups[negativeKey]?.curves;
    const rocAuc = content.roc_auc_scores[scoreKey];

    if (!positiveCurves || !negativeCurves || !rocAuc) {
      throw new Error(`Missing precomputed content for selection ${scoreKey}.`);
    }

    const positiveFigure = buildDensityFigure(positiveCurves, POSITIVE_COLORS);
    const negativeFigure = buildDensityFigure(negativeCurves, NEGATIVE_COLORS);

    Plotly.react(elements.positiveChart, positiveFigure.data, positiveFigure.layout, {
      responsive: true,
      displaylogo: false,
    });
    Plotly.react(elements.negativeChart, negativeFigure.data, negativeFigure.layout, {
      responsive: true,
      displaylogo: false,
    });

    elements.globalScore.textContent = Number(content.global_score).toFixed(3);
    elements.meanScore.textContent = rocAuc.mean;
    updateMetricList(elements, rocAuc.values);
  }

  async function loadContent(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load static content: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async function initExplorer(root) {
    if (root.dataset.federatedRocAucMounted === "true") {
      return;
    }

    root.dataset.federatedRocAucMounted = "true";
    const elements = getElements(root);

    try {
      if (typeof Plotly === "undefined") {
        throw new Error("Plotly.js did not load. Check your network connection and try again.");
      }

      const contentUrl = root.dataset.contentUrl;
      if (!contentUrl) {
        throw new Error("Missing content URL for the federated ROC-AUC explorer.");
      }

      setStatus(elements, "Loading interactive visualization…");
      root.__fraeContent = await loadContent(contentUrl);

      const ratios = root.__fraeContent.ratios;
      const defaultPositive = root.__fraeContent.defaults?.positive_ratio ?? ratios[0];
      const defaultNegative = root.__fraeContent.defaults?.negative_ratio ?? ratios[0];

      populateRatioSelect(elements.positiveRatio, ratios, defaultPositive);
      populateRatioSelect(elements.negativeRatio, ratios, defaultNegative);

      elements.positiveRatio.addEventListener("change", () => renderCharts(root));
      elements.negativeRatio.addEventListener("change", () => renderCharts(root));

      showShell(elements);
      renderCharts(root);
    } catch (error) {
      console.error(error);
      showError(elements, error.message);
    }
  }

  function initAllExplorers() {
    document
      .querySelectorAll("[data-federated-roc-auc-explorer]")
      .forEach((root) => initExplorer(root));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllExplorers, { once: true });
  } else {
    initAllExplorers();
  }
})();

