// ==========================================================
// SNMM ROOM RESERVATION
// PARTICIPANT FRONTEND
// ==========================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbx7Z-L7l4hTPvZu3fHDbFT-v3lSc6p0VEQNamyGeicHVo-a4apXDt7EQtwqKzoHPX0ibw/exec";


// ==========================================================
// GLOBAL PARTICIPANT
// ==========================================================

let currentParticipant = null;


// ==========================================================
// VERIFY PARTICIPANT
// ==========================================================

async function verifyParticipant() {

    const input = document.getElementById("registrationCode");

    // Get only what the participant typed
    let lastFive = input.value.trim();

    // Remove anything that isn't a number
    lastFive = lastFive.replace(/\D/g, "");

    // Put cleaned value back into input
    input.value = lastFive;

    // Must be exactly 5 digits
    if (!/^\d{5}$/.test(lastFive)) {

        showMessage(
            "Please enter the last 5 digits of your registration number.",
            "danger"
        );

        input.focus();

        return;
    }

    // ======================================================
    // AUTOMATICALLY BUILD FULL REGISTRATION NUMBER
    // ======================================================

    const registrationCode =
        "SNMMC2026-" + lastFive;

    console.log(
        "Full Registration Number:",
        registrationCode
    );

    showLoading(true);

    try {

        const url =
            API_URL +
            "?action=verifyParticipant" +
            "&registrationCode=" +
            encodeURIComponent(registrationCode);

        const response = await fetch(url);

        const result = await response.json();

        if (!result.success) {

            showMessage(
                result.message ||
                "Participant could not be verified.",
                "danger"
            );

            hideParticipant();

            return;
        }

        // ==================================================
        // PARTICIPANT VERIFIED
        // ==================================================

        currentParticipant = result.participant;

        displayParticipant(currentParticipant);

        showMessage(
            "Participant verified successfully.",
            "success"
        );

        // Load available rooms
        loadRoomTypes();

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the room reservation system.",
            "danger"
        );

    }

    finally {

        showLoading(false);

    }
}

// ==========================================================
// DISPLAY PARTICIPANT
// ==========================================================

function displayParticipant(
  participant
) {

  document
    .getElementById(
      "participantSection"
    )
    .classList
    .remove("d-none");


  document
    .getElementById(
      "participantName"
    )
    .textContent =
      participant.name || "";


  document
    .getElementById(
      "participantStaffId"
    )
    .textContent =
      participant.staffId || "";


  document
    .getElementById(
      "participantPosition"
    )
    .textContent =
      participant.position || "";


  document
    .getElementById(
      "participantAgency"
    )
    .textContent =
      participant.agency || "";


  document
    .getElementById(
      "participantParticipation"
    )
    .textContent =
      participant.participation || "";


  document
    .getElementById(
      "participantRegistration"
    )
    .textContent =
      participant.registrationCode || "";

}


// ==========================================================
// LOAD ROOM TYPES
// ==========================================================

async function loadRoomTypes() {

  showLoading(true);


  try {

    const response =
      await fetch(
        API_URL +
        "?action=getRoomTypes"
      );


    const result =
      await response.json();


    if (!result.success) {

      showMessage(
        result.message ||
        "Unable to load rooms.",
        "danger"
      );

      return;
    }


    renderRooms(
      result.rooms || []
    );


    document
      .getElementById(
        "roomSection"
      )
      .classList
      .remove("d-none");

  }
  catch (error) {

    console.error(error);

    showMessage(
      "Unable to load available rooms.",
      "danger"
    );

  }
  finally {

    showLoading(false);

  }

}


// ==========================================================
// DISPLAY ROOM TYPES
// ==========================================================

function renderRooms(
  rooms
) {

  const container =
    document.getElementById(
      "roomContainer"
    );


  container.innerHTML = "";


  if (!rooms.length) {

    container.innerHTML = `

      <div class="col-12">

        <div class="alert alert-warning text-center">

          No accommodation is currently available.

        </div>

      </div>

    `;

    return;
  }


  rooms.forEach(
    function(room) {

      const available =
        Number(
          room.availableBeds
        ) || 0;


      const isFull =
        available <= 0;


      const statusClass =
        isFull
          ? "bg-danger"
          : "bg-success";


      const buttonDisabled =
        isFull
          ? "disabled"
          : "";


      const cardClass =
        isFull
          ? "full-room"
          : "";


      container.innerHTML += `

        <div class="col-md-6 col-lg-4">

          <div
            class="card shadow-sm room-card ${cardClass}"
          >

            <div class="card-body">

              <div class="text-center">

                <div class="room-icon">
                  🛏️
                </div>

                <h5 class="mt-2">
                  ${escapeHtml(room.roomType)}
                </h5>

                <span
                  class="badge ${statusClass} badge-status"
                >
                  ${isFull ? "FULL" : "AVAILABLE"}
                </span>

              </div>


              <hr>


              <div class="row text-center">

                <div class="col-6">

                  <small class="text-muted">
                    People / Room
                  </small>

                  <div class="fw-bold">
                    ${room.peoplePerRoom}
                  </div>

                </div>


                <div class="col-6">

                  <small class="text-muted">
                    Total Rooms
                  </small>

                  <div class="fw-bold">
                    ${room.totalRooms}
                  </div>

                </div>

              </div>


              <div class="text-center mt-3">

                <small class="text-muted">
                  Available Beds
                </small>

                <div class="available-number">

                  ${available}

                </div>

              </div>


              <div class="text-center mt-3">

                <div class="room-price">

                  GH₵ ${Number(
                    room.rate || 0
                  ).toLocaleString(
                    "en-GH",
                    {
                      minimumFractionDigits: 2
                    }
                  )}

                </div>

                <small class="text-muted">

                  ${escapeHtml(
                    room.rateType || ""
                  )}

                </small>

              </div>


              <button

                class="btn btn-primary w-100 mt-4"

                ${buttonDisabled}

                onclick="
                  reserveBed(
                    '${escapeJs(room.roomTypeId)}'
                  )
                "

              >

                ${
                  isFull
                    ? "Fully Booked"
                    : "Reserve Bed"
                }

              </button>

            </div>

          </div>

        </div>

      `;

    }
  );

}


// ==========================================================
// RESERVE BED
// ==========================================================

async function reserveBed(
  roomTypeId
) {

  if (!currentParticipant) {

    showMessage(
      "Please verify your registration first.",
      "danger"
    );

    return;
  }


  const confirmed =
    confirm(
      "Are you sure you want to reserve this room type?"
    );


  if (!confirmed) {

    return;

  }


  showLoading(true);


  try {

    const url =
      API_URL +
      "?action=reserveBed" +
      "&registrationCode=" +
      encodeURIComponent(
        currentParticipant.registrationCode
      ) +
      "&roomTypeId=" +
      encodeURIComponent(
        roomTypeId
      );


    const response =
      await fetch(url);


    const result =
      await response.json();


    if (!result.success) {

      showMessage(
        result.message ||
        "Reservation failed.",
        "danger"
      );

      return;
    }


    const reservation =
      result.reservation;


    document
      .getElementById(
        "reservationResult"
      )
      .innerHTML = `

        <div class="text-center">

          <div
            class="display-5 mb-3"
          >
            ✅
          </div>

          <h5>
            Bed Reserved Successfully
          </h5>

          <p>
            Your reservation has been created.
          </p>

          <div class="alert alert-info">

            <strong>
              Reservation ID
            </strong>

            <br>

            <span class="fs-4">
              ${escapeHtml(
                reservation.reservationId
              )}
            </span>

          </div>


          <p>
            <strong>
              Participant:
            </strong>

            ${escapeHtml(
              reservation.participantName
            )}
          </p>


          <p>
            <strong>
              Room:
            </strong>

            ${escapeHtml(
              reservation.roomType
            )}
          </p>


          <p>
            <strong>
              Payment Status:
            </strong>

            Pending
          </p>


          <p class="text-muted">

            Please proceed with the accommodation
            payment and provide your reservation ID
            to the Finance/Room Allocation team.

          </p>

        </div>

      `;


    const modal =
      new bootstrap.Modal(
        document.getElementById(
          "reservationModal"
        )
      );


    modal.show();


    // Refresh inventory

    await loadRoomTypes();

  }
  catch (error) {

    console.error(error);

    showMessage(
      "Unable to complete the reservation.",
      "danger"
    );

  }
  finally {

    showLoading(false);

  }

}


// ==========================================================
// MESSAGE
// ==========================================================

function showMessage(
  message,
  type
) {

  document
    .getElementById(
      "verificationMessage"
    )
    .innerHTML = `

      <div class="alert alert-${type}">
        ${escapeHtml(message)}
      </div>

    `;

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading(
  show
) {

  document
    .getElementById(
      "loading"
    )
    .classList
    .toggle(
      "d-none",
      !show
    );

}


// ==========================================================
// HIDE PARTICIPANT
// ==========================================================

function hideParticipant() {

  currentParticipant = null;


  document
    .getElementById(
      "participantSection"
    )
    .classList
    .add("d-none");


  document
    .getElementById(
      "roomSection"
    )
    .classList
    .add("d-none");

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
  .replace(
    /&/g,
    "&amp;"
  )
  .replace(
    /</g,
    "&lt;"
  )
  .replace(
    />/g,
    "&gt;"
  )
  .replace(
    /"/g,
    "&quot;"
  )
  .replace(
    /'/g,
    "&#039;"
  );

}


// ==========================================================
// JAVASCRIPT ESCAPE
// ==========================================================

function escapeJs(
  value
) {

  return String(
    value ?? ""
  )
  .replace(
    /\\/g,
    "\\\\"
  )
  .replace(
    /'/g,
    "\\'"
  )
  .replace(
    /\r?\n/g,
    "\\n"
  );

}
// ==========================================================
// DARK / LIGHT MODE
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

  initializeTheme();

});


// ==========================================================
// INITIALIZE THEME
// ==========================================================

function initializeTheme() {

  const savedTheme =
    localStorage.getItem("snmm-theme");

  if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

  }
  else {

    document.body.classList.remove("dark-mode");

  }

  updateThemeButton();

}


// ==========================================================
// TOGGLE THEME
// ==========================================================

function toggleTheme() {

  document.body.classList.toggle("dark-mode");

  const isDark =
    document.body.classList.contains("dark-mode");

  localStorage.setItem(
    "snmm-theme",
    isDark ? "dark" : "light"
  );

  updateThemeButton();

}
// ==========================================================
// DARK / LIGHT MODE
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    const themeToggle =
        document.getElementById("themeToggle");

    if (!themeToggle) return;

    const savedTheme =
        localStorage.getItem("snmm-theme") || "light";

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }

    updateThemeButton();


    themeToggle.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );

            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );

            localStorage.setItem(
                "snmm-theme",
                isDark ? "dark" : "light"
            );

            updateThemeButton();

        }
    );


    function updateThemeButton() {

        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );

        if (isDark) {

            themeToggle.innerHTML =
                "☀️";

        } else {

            themeToggle.innerHTML =
                "🌙 ";

        }

    }

});