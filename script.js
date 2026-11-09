/* ==========================================
   HOSTELBITE - MAIN JAVASCRIPT
   Front-end academic demonstration
   ========================================== */

const STORAGE_KEYS = {
    meals: "hostelBiteMeals",
    announcements: "hostelBiteAnnouncements",
    feedback: "hostelBiteFeedback",
    complaints: "hostelBiteComplaints"
};

/* ---------- BROWSER STORAGE HELPERS ---------- */

function getData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not read stored data:", error);
        return [];
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        alert("Could not save data in this browser. Please check your browser storage.");
        console.error("Could not save data:", error);
        return false;
    }
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function createEmptyRow(message, columnCount) {
    const row = document.createElement("tr");
    const cell = createElement("td", "admin-empty", message);

    cell.colSpan = columnCount;
    row.appendChild(cell);

    return row;
}

function makeReference(prefix) {
    return prefix + "-" + Date.now().toString(36).toUpperCase()
        + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString();
}

/* ---------- ADMIN DASHBOARD ---------- */

function initializeAdmin() {
    const mealForm = document.getElementById("adminMealForm");
    const announcementForm = document.getElementById("adminAnnouncementForm");

    const mealTable = document.getElementById("adminMealTable");
    const announcementList = document.getElementById("adminAnnouncementList");
    const feedbackTable = document.getElementById("adminFeedbackTable");

    const mealCount = document.getElementById("adminMealCount");
    const feedbackCount = document.getElementById("adminFeedbackCount");
    const announcementCount = document.getElementById("adminAnnouncementCount");

    function renderMeals() {
        if (!mealTable) return;

        const meals = getData(STORAGE_KEYS.meals);
        mealTable.replaceChildren();

        if (meals.length === 0) {
            mealTable.appendChild(createEmptyRow("No meals added yet.", 4));
            return;
        }

        meals.forEach(meal => {
            const row = document.createElement("tr");

            row.appendChild(createElement("td", "", meal.name));
            row.appendChild(createElement("td", "", meal.category));
            row.appendChild(createElement("td", "", meal.time));

            const actionCell = document.createElement("td");
            const deleteButton = createElement("button", "admin-delete", "Delete");
            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this meal from the admin list?")) return;

                const updatedMeals = getData(STORAGE_KEYS.meals)
                    .filter(item => item.id !== meal.id);

                if (saveData(STORAGE_KEYS.meals, updatedMeals)) {
                    renderMeals();
                    updateAdminStats();
                }
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            mealTable.appendChild(row);
        });
    }

    function renderAnnouncements() {
        if (!announcementList) return;

        const announcements = getData(STORAGE_KEYS.announcements);
        announcementList.replaceChildren();

        if (announcements.length === 0) {
            announcementList.appendChild(
                createElement("p", "admin-empty", "No announcements published yet.")
            );
            return;
        }

        announcements.slice().reverse().forEach(item => {
            const card = createElement("article", "tracking-item");
            card.style.marginBottom = "12px";

            card.appendChild(createElement("h3", "", item.title));
            card.appendChild(createElement("p", "", item.message));
            card.appendChild(
                createElement("p", "entry-meta", formatDate(item.createdAt))
            );

            const deleteButton = createElement("button", "admin-delete", "Delete");
            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this announcement?")) return;

                const updated = getData(STORAGE_KEYS.announcements)
                    .filter(entry => entry.id !== item.id);

                if (saveData(STORAGE_KEYS.announcements, updated)) {
                    renderAnnouncements();
                    updateAdminStats();
                }
            });

            card.appendChild(deleteButton);
            announcementList.appendChild(card);
        });
    }

    function renderFeedback() {
        if (!feedbackTable) return;

        const feedbackEntries = getData(STORAGE_KEYS.feedback);
        feedbackTable.replaceChildren();

        if (feedbackEntries.length === 0) {
            feedbackTable.appendChild(
                createEmptyRow("No feedback available yet.", 4)
            );
            return;
        }

        feedbackEntries.slice().reverse().forEach(item => {
            const row = document.createElement("tr");

            row.appendChild(createElement("td", "", item.name));
            row.appendChild(createElement("td", "", item.meal));
            row.appendChild(createElement("td", "", "★".repeat(item.rating)));
            row.appendChild(createElement("td", "", item.message));

            feedbackTable.appendChild(row);
        });
    }

    function updateAdminStats() {
        if (mealCount) {
            mealCount.textContent = getData(STORAGE_KEYS.meals).length;
        }

        if (feedbackCount) {
            feedbackCount.textContent = getData(STORAGE_KEYS.feedback).length;
        }

        if (announcementCount) {
            announcementCount.textContent =
                getData(STORAGE_KEYS.announcements).length;
        }
    }

    if (mealForm) {
        mealForm.addEventListener("submit", event => {
            event.preventDefault();

            const meal = {
                id: makeReference("MEAL"),
                name: document.getElementById("mealName").value.trim(),
                category: document.getElementById("mealCategory").value,
                time: document.getElementById("mealTime").value.trim(),
                description: document.getElementById("mealDescription").value.trim(),
                createdAt: new Date().toISOString()
            };

            if (!meal.name || !meal.category || !meal.time || !meal.description) {
                alert("Please complete all meal fields.");
                return;
            }

            const meals = getData(STORAGE_KEYS.meals);
            meals.push(meal);

            if (saveData(STORAGE_KEYS.meals, meals)) {
                mealForm.reset();
                renderMeals();
                updateAdminStats();
                alert("Meal added to the demonstration admin list!");
            }
        });
    }

    if (announcementForm) {
        announcementForm.addEventListener("submit", event => {
            event.preventDefault();

            const title = document.getElementById("announcementTitle")
                .value.trim();
            const message = document.getElementById("announcementMessage")
                .value.trim();

            if (!title || !message) {
                alert("Please enter the announcement title and details.");
                return;
            }

            const announcements = getData(STORAGE_KEYS.announcements);

            announcements.push({
                id: makeReference("ANN"),
                title,
                message,
                createdAt: new Date().toISOString()
            });

            if (saveData(STORAGE_KEYS.announcements, announcements)) {
                announcementForm.reset();
                renderAnnouncements();
                updateAdminStats();
                alert("Announcement published in the demonstration admin panel!");
            }
        });
    }

    renderMeals();
    renderAnnouncements();
    renderFeedback();
    updateAdminStats();
}

/* ---------- STUDENT FEEDBACK ---------- */

function initializeFeedback() {
    const form = document.getElementById("feedbackForm");
    const list = document.getElementById("feedbackList");

    if (!form) return;

    function renderFeedbackList() {
        if (!list) return;

        const entries = getData(STORAGE_KEYS.feedback);
        list.replaceChildren();

        if (entries.length === 0) {
            const empty = createElement("div", "feedback-empty");
            empty.appendChild(createElement("div", "", "⭐"));
            empty.appendChild(createElement("strong", "", "No feedback submitted yet"));
            empty.appendChild(createElement("p", "", "Be the first to share your dining experience!"));
            list.appendChild(empty);
            return;
        }

        entries.slice().reverse().forEach(item => {
            const card = createElement("article", "feedback-entry");

            card.appendChild(createElement("h3", "", item.name));
            card.appendChild(
                createElement("div", "entry-rating", "★".repeat(item.rating)
                    + "☆".repeat(5 - item.rating))
            );
            card.appendChild(createElement("p", "", item.message));
            card.appendChild(
                createElement(
                    "p",
                    "entry-meta",
                    item.meal + " · " + formatDate(item.createdAt)
                )
            );

            list.appendChild(card);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("feedbackStudentName").value.trim();
        const studentId = document.getElementById("feedbackStudentId").value.trim();
        const meal = document.getElementById("feedbackMeal").value;
        const message = document.getElementById("feedbackMessage").value.trim();
        const ratingInput = form.querySelector('input[name="rating"]:checked');

        if (!name || !studentId || !meal || !message || !ratingInput) {
            alert("Please complete all fields and select a star rating.");
            return;
        }

        const entries = getData(STORAGE_KEYS.feedback);

        entries.push({
            id: makeReference("FDB"),
            name,
            studentId,
            meal,
            rating: Number(ratingInput.value),
            message,
            createdAt: new Date().toISOString()
        });

        if (saveData(STORAGE_KEYS.feedback, entries)) {
            form.reset();
            renderFeedbackList();
            alert("Thank you! Your feedback has been saved in this browser.");
        }
    });

    renderFeedbackList();
}

/* ---------- STUDENT COMPLAINTS ---------- */

function initializeComplaints() {
    const form = document.getElementById("complaintForm");
    const list = document.getElementById("complaintList");

    if (!form) return;

    function renderComplaints() {
        if (!list) return;

        const complaints = getData(STORAGE_KEYS.complaints);
        list.replaceChildren();

        if (complaints.length === 0) {
            const empty = createElement("div", "complaint-empty");
            empty.appendChild(createElement("div", "", "📋"));
            empty.appendChild(createElement("strong", "", "No complaints yet"));
            empty.appendChild(createElement("p", "", "Your submitted complaints will appear here."));
            list.appendChild(empty);
            return;
        }

        complaints.slice().reverse().forEach(item => {
            const card = createElement("article", "tracking-item");

            card.appendChild(createElement("h3", "", item.category));
            card.appendChild(createElement("p", "", item.description));
            card.appendChild(
                createElement("p", "priority-label", "Priority: " + item.priority)
            );
            card.appendChild(
                createElement("p", "entry-meta", "Reference: " + item.id)
            );

            const meta = createElement("div", "tracking-meta");
            meta.appendChild(
                createElement("span", "complaint-status", item.status)
            );
            meta.appendChild(
                createElement("span", "priority-label", formatDate(item.createdAt))
            );

            card.appendChild(meta);
            list.appendChild(card);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("studentName").value.trim();
        const studentId = document.getElementById("studentId").value.trim();
        const category = document.getElementById("complaintCategory").value;
        const priority = document.getElementById("complaintPriority").value;
        const description = document.getElementById("complaintDescription")
            .value.trim();

        if (!name || !studentId || !category || !priority || description.length < 10) {
            alert("Please complete all fields. The description must be at least 10 characters.");
            return;
        }

        const complaints = getData(STORAGE_KEYS.complaints);

        const complaint = {
            id: makeReference("CMP"),
            name,
            studentId,
            category,
            priority,
            description,
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        complaints.push(complaint);

        if (saveData(STORAGE_KEYS.complaints, complaints)) {
            form.reset();
            renderComplaints();

            alert(
                "Complaint saved successfully!\nReference number: " + complaint.id
            );
        }
    });

    renderComplaints();
}

/* ---------- INITIALIZE PAGES ---------- */

document.addEventListener("DOMContentLoaded", () => {
    initializeAdmin();
    initializeFeedback();
    initializeComplaints();
});