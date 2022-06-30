const STARTUP_PLACEHOLDER = "/img/betagouv-rectangle.png";

var USERTYPES = {
  "etablissement-scolaire": "Etablissements scolaires et d'enseignement supérieur",
  etat: "Services de l'État",
  particulier: "Particuliers",
  entreprise: "Entreprises et professionels",
  "collectivite-territoriale": "Collectivités territoriales",
  parlement: "Parlement",
  association: "Associations",
};

var filters = [];

var createStartupCard = function (startup) {
  var card = document.createElement("div");
  card.className = "fr-col-12 fr-col-md-3";
  card.id = startup.id;

  var startupSponsors = startup.sponsors
    .map((sponsor) => {
      return '<abbr title="' + sponsor.name + '">' + sponsor.acronym + "</abbr>";
    })
    .join(" / ");
  if (startupSponsors) {
    startupSponsors = '<p class="fr-card__detail">' + startupSponsors + "</p>";
  }
  var startupUsertypes = startup.attributes.usertypes
    .map((usertype) => {
      return '<abbr title="' + USERTYPES[usertype] + '">' + USERTYPES[usertype] + "</abbr>";
    })
    .join(" / ");
  if (startupUsertypes) {
    startupUsertypes = '<p class="fr-card__detail">' + startupUsertypes + "</p>";
  }
  card.innerHTML = `
        <div class="fr-card fr-card--grey fr-enlarge-link">
            <div class="fr-card__body">
                <h2 class="fr-card__title">
                    <a class="fr-card__link" href="/startups/${startup.id}.html">${startup.attributes.name}</a>
                </h2>
                ${startupSponsors}
                <p class="fr-card__desc">${startup.attributes.pitch}</p>
            </div>
            <div class="fr-card__img">
                <img class="screenshot lozad"
                    src="${STARTUP_PLACEHOLDER}"
                    data-src="${startup.attributes["screenshot-url"]}"
                    alt=""
                    />
            </div>
        </div>`;
  return card;
};

var generateDataWithHtmlCards = function (data) {
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    for (var j = 0; j < data[key].length; j++) {
      data[key][j]["html"] = createStartupCard(data[key][j]);
    }
  }
  return data;
};

var displayNoDataMessage = function (shouldDisplay) {
  var noDataMessage = document.getElementById("no-data-message");
  if (shouldDisplay) {
    noDataMessage.style.display = "block";
  } else {
    noDataMessage.style.display = "none";
  }
};

var filterCards = function (data, value) {
  if (filters["incubator"]) {
    data = data.filter((d) => d.incubator_id === filters["incubator"]);
  }
  if (filters["usertypes"]) {
    data = data.filter((d) => d.attributes.usertypes.includes(filters["usertypes"]));
  }
  return data;
};

var updateCards = function (data) {
  displayNoDataMessage(false);
  var grid = document.getElementsByClassName("startups")[0];
  var keys = Object.keys(data);
  var count = 0;
  for (var i = 0; i < keys.length; i++) {
    var phase = keys[i];
    var phaseElement = document.getElementById(phase);
    var optionElement = document.getElementById(phase + "-option");
    var grid = phaseElement.getElementsByClassName("startups")[0];
    var documentFragment = document.createDocumentFragment();
    var dataToDisplay = filterCards(data[phase]);
    count = count + dataToDisplay.length;
    if (!dataToDisplay.length) {
      phaseElement.style.display = "none";
      optionElement.style.display = "none";
      var noContentMessage = phaseElement.getElementsByClassName("phase-no-result");
      if (!noContentMessage.length) {
        var noContentMessage = document.createElement("p");
        noContentMessage.className = "phase-no-result";
        noContentMessage.innerText = "Il n'y a pas de startup dans cette phase actuellement.";
        phaseElement.appendChild(noContentMessage);
      }
    } else {
      phaseElement.style.display = "block";
      optionElement.style.display = "block";
      var noContentMessage = phaseElement.getElementsByClassName("phase-no-result");
      if (noContentMessage.length) {
        phaseElement.removeChild(noContentMessage[0]);
      }
    }
    var phaseCounter = phaseElement.getElementsByClassName("phase-counter")[0];
    if (phaseCounter) {
      phaseCounter.innerText = dataToDisplay.length;
    }
    var phaseLabel = phaseElement.getElementsByClassName("phase-label")[0];
    if (phaseLabel) {
      var currentPhase = phases.filter((p) => p.status === phase)[0];
      var plural = dataToDisplay.length > 1 ? "s" : "";
      if (currentPhase.status === "success") {
        phaseLabel.innerText = currentPhase.label.toLowerCase() + "s";
      } else if (currentPhase.status === "alumni") {
        phaseLabel.innerText = currentPhase.label.toLowerCase();
      } else {
        phaseLabel.innerText = currentPhase.type_label + plural;
      }
    }
    for (var j = 0; j < dataToDisplay.length; j++) {
      documentFragment.appendChild(dataToDisplay[j].html);
    }
    grid.innerHTML = "";
    grid.appendChild(documentFragment);
    if (window.lozad) {
      const observer = lozad();
      observer.observe();
    }
  }
  if (!count) {
    displayNoDataMessage(true);
  }
};

var createIncubatorSelect = function (data, incubators, initValue) {
  console.log("LCS CREATE INCUBATOR SELECT");
  var selectIncubator = document.getElementById("select-incubateur");
  var optionFragment = document.createDocumentFragment();
  for (var i = 0; i < incubators.length; i++) {
    var incubator = incubators[i];
    var option = document.createElement("option");
    option.innerText = incubator.title;
    option.value = incubator.id;
    optionFragment.appendChild(option);
  }
  selectIncubator.appendChild(optionFragment);
  var onIncubatorChange = function (value) {
    filters["incubator"] = value;
    var incubatorElements = document.getElementsByClassName("incubator-header");
    for (var i = 0; i < incubatorElements.length; i++) {
      var incubatorElement = incubatorElements[i];
      if (incubatorElement.id !== value) {
        incubatorElement.style.display = "none";
      } else {
        incubatorElement.style.display = "block";
      }
    }
    updateCards(data);
  };
  if (initValue) {
    selectIncubator.value = initValue;
    onIncubatorChange(initValue);
  }
  selectIncubator.addEventListener("change", function (e) {
    var value = e.target.value;
    onIncubatorChange(value);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("incubateur", value);
    history.replaceState(null, null, window.location.origin + window.location.pathname + "?" + urlParams);
  });
};

var createUsertypesSelect = function (data, initValue) {
  var selectUsertypes = document.getElementById("select-usertypes");
  var optionFragment = document.createDocumentFragment();
  for (var i = 0; i < USERTYPES.length; i++) {
    var usertype = USERTYPES[i];
    var option = document.createElement("option");
    option.innerText = usertype.title;
    option.value = usertype.id;
    optionFragment.appendChild(option);
  }
  selectUsertypes.appendChild(optionFragment);
  var onUsertypesChange = function (value) {
    filters["usertypes"] = value;
    updateCards(data);
  };
  if (initValue) {
    selectUsertypes.value = initValue;
    onUsertypesChange(initValue);
  }
  selectUsertypes.addEventListener("change", function (e) {
    var value = e.target.value;
    onUsertypesChange(value);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("usertypes", value);
    history.replaceState(null, null, window.location.origin + window.location.pathname + "?" + urlParams);
  });
};
