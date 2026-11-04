
document.addEventListener("DOMContentLoaded", () => {

    
    // 1. ELEMENTS
   

    const sidebar = document.getElementById("sidebar");
    const mobileMenu = document.getElementById("mobileMenu");
    const themeToggle = document.getElementById("themeToggle");
    const topTheme = document.getElementById("topTheme");
    const toast = document.getElementById("toast");

    
    // 2. TOAST NOTIFICATION
   

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(window.novaToastTimer);

        window.novaToastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    
    // 3. PAGE NAVIGATION
   

    const views = document.querySelectorAll(".view");
    const navLinks = document.querySelectorAll(".nav-link");
    const breadcrumb = document.getElementById("breadcrumbCurrent");

    function showView(viewName) {
        const target = document.getElementById(viewName);

        if (!target) return;

        views.forEach(view => {
            view.classList.remove("active-view");
        });

        target.classList.add("active-view");

        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.view === viewName
            );
        });

        const activeLink = document.querySelector(
            `.nav-link[data-view="${viewName}"]`
        );

        if (breadcrumb) {
            breadcrumb.textContent = activeLink
                ? activeLink.textContent.trim()
                : viewName;
        }

        sidebar?.classList.remove("open");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            showView(link.dataset.view);
        });
    });

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            showView(button.dataset.go);
        });
    });


    // 4. MOBILE SIDEBAR
   

    mobileMenu?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
    });

    document.addEventListener("click", event => {
        if (
            window.innerWidth <= 768 &&
            sidebar?.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !mobileMenu?.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }
    });

  



// 5. DARK / LIGHT THEME


function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("novaTheme", theme);

    if (themeToggle) {
        themeToggle.innerHTML =
            `<span class="nav-icon">${theme === "dark" ? "☀" : "◐"}</span> Toggle appearance`;
    }

    if (topTheme) {
        topTheme.textContent = theme === "dark" ? "☀" : "◐";
    }
}

const savedTheme = localStorage.getItem("novaTheme") || "light";

applyTheme(savedTheme);

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");

    applyTheme(current === "dark" ? "light" : "dark");
}

themeToggle?.addEventListener("click", toggleTheme);
topTheme?.addEventListener("click", toggleTheme);


    // =====================================
    // 6. DATE LABEL
    // =====================================

    const todayLabel = document.getElementById("todayLabel");

    if (todayLabel) {
        todayLabel.textContent = new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    }

    // =====================================
    // 7. CAREER MILESTONES
    // =====================================

    const milestoneList = document.getElementById("milestoneList");
    const goalInput = document.getElementById("goalInput");
    const addGoal = document.getElementById("addGoal");
    const resetGoals = document.getElementById("resetGoals");

    const defaultGoals = [
        { id: 1, text: "Build a strong HTML foundation", done: true },
        { id: 2, text: "Master CSS and responsive layouts", done: true },
        { id: 3, text: "Practice JavaScript projects", done: false },
        { id: 4, text: "Learn React fundamentals", done: false },
        { id: 5, text: "Create a professional portfolio", done: false }
    ];

    let goals;

    try {
        const storedGoals = JSON.parse(
            localStorage.getItem("novaGoals")
        );

        goals = Array.isArray(storedGoals)
            ? storedGoals
            : defaultGoals;
    } catch {
        goals = defaultGoals;
    }

    function saveGoals() {
        localStorage.setItem("novaGoals", JSON.stringify(goals));
    }

    function renderGoals() {
        if (!milestoneList) return;

        milestoneList.innerHTML = "";

        goals.forEach(goal => {
            const item = document.createElement("div");

            item.className = `milestone ${goal.done ? "done" : ""}`;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = goal.done;
            checkbox.setAttribute("aria-label", "Complete milestone");

            checkbox.addEventListener("change", () => {
                goal.done = checkbox.checked;
                saveGoals();
                renderGoals();
                updateDashboard();
                showToast(
                    goal.done
                        ? "Milestone completed!"
                        : "Milestone marked as pending."
                );
            });

            const text = document.createElement("span");
            text.textContent = goal.text;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "delete-goal";
            removeButton.textContent = "×";
            removeButton.setAttribute("aria-label", "Delete milestone");

            removeButton.addEventListener("click", () => {
                goals = goals.filter(item => item.id !== goal.id);
                saveGoals();
                renderGoals();
                updateDashboard();
                showToast("Milestone removed.");
            });

            item.append(checkbox, text, removeButton);
            milestoneList.appendChild(item);
        });

        updateDashboard();
    }

    addGoal?.addEventListener("click", () => {
        const goalText = goalInput?.value.trim();

        if (!goalText) {
            showToast("Please enter a milestone first.");
            goalInput?.focus();
            return;
        }

        goals.push({
            id: Date.now(),
            text: goalText,
            done: false
        });

        saveGoals();
        renderGoals();

        goalInput.value = "";
        showToast("New milestone added!");
    });

    goalInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            addGoal?.click();
        }
    });

    resetGoals?.addEventListener("click", () => {
        goals = defaultGoals.map(goal => ({ ...goal }));
        saveGoals();
        renderGoals();
        showToast("Career roadmap reset.");
    });

    // =====================================
    // 8. SKILL ASSESSMENT
    // =====================================

    const skillQuestions = document.getElementById("skillQuestions");
    const saveAssessment = document.getElementById("saveAssessment");
    const assessmentMessage = document.getElementById("assessmentMessage");

    const skillScore = document.getElementById("skillScore");

    const skillNames = [
        "HTML",
        "CSS",
        "JavaScript",
        "Responsive Design",
        "Problem Solving"
    ];

    const skillLevels = [
        "Beginner",
        "Basic",
        "Intermediate",
        "Advanced",
        "Expert"
    ];

    let skillRatings = {};

    try {
        skillRatings = JSON.parse(
            localStorage.getItem("novaSkills")
        ) || {};
    } catch {
        skillRatings = {};
    }

    function renderAssessment() {
        if (!skillQuestions) return;

        skillQuestions.innerHTML = "";

        skillNames.forEach((skill, index) => {
            const row = document.createElement("div");
            row.className = "skill-question";

            const heading = document.createElement("div");
            heading.className = "skill-question-heading";

            const name = document.createElement("strong");
            name.textContent = skill;

            const selectedLevel = document.createElement("span");
            selectedLevel.className = "skill-level";
            selectedLevel.textContent =
                skillRatings[skill]
                    ? skillLevels[skillRatings[skill] - 1]
                    : "Not rated";

            heading.append(name, selectedLevel);

            const options = document.createElement("div");
            options.className = "skill-options";

            skillLevels.forEach((level, levelIndex) => {
                const value = levelIndex + 1;

                const button = document.createElement("button");
                button.type = "button";
                button.textContent = level;
                button.className =
                    skillRatings[skill] === value ? "selected" : "";

                button.addEventListener("click", () => {
                    skillRatings[skill] = value;
                    renderAssessment();
                });

                options.appendChild(button);
            });

            row.append(heading, options);
            skillQuestions.appendChild(row);
        });
    }

    function calculateSkillScore() {
        const ratings = Object.values(skillRatings);

        if (!ratings.length) return 0;

        const total = ratings.reduce((sum, value) => sum + value, 0);
        return Math.round((total / (ratings.length * 5)) * 100);
    }

    saveAssessment?.addEventListener("click", () => {
        if (Object.keys(skillRatings).length !== skillNames.length) {
            if (assessmentMessage) {
                assessmentMessage.textContent =
                    "Please rate all five skills before saving.";
            }

            showToast("Complete all skill ratings first.");
            return;
        }

        localStorage.setItem(
            "novaSkills",
            JSON.stringify(skillRatings)
        );

        const score = calculateSkillScore();

        if (skillScore) {
            skillScore.textContent = `${score}%`;
        }

        if (assessmentMessage) {
            assessmentMessage.textContent =
                "Your skill assessment has been saved successfully!";
        }

        updateDashboard();
        showToast("Assessment saved successfully!");
    });

    // =====================================
    // 9. OPPORTUNITY SEARCH & FILTER
    // =====================================

    const jobSearch = document.getElementById("jobSearch");
    const jobType = document.getElementById("jobType");
    const jobGrid = document.getElementById("jobGrid");

    function filterOpportunities() {
        if (!jobGrid) return;

        const searchValue = jobSearch?.value.toLowerCase().trim() || "";
        const selectedType = jobType?.value.toLowerCase() || "all";

        const cards = jobGrid.querySelectorAll(".job-card");

        let visibleCount = 0;

        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardType = (
                card.dataset.type ||
                card.getAttribute("data-category") ||
                ""
            ).toLowerCase();

            const matchesSearch = cardText.includes(searchValue);
            const matchesType =
                selectedType === "all" ||
                cardType === selectedType;

            const visible = matchesSearch && matchesType;

            card.style.display = visible ? "" : "none";

            if (visible) visibleCount++;
        });

        let emptyMessage = jobGrid.querySelector(".empty-results");

        if (!emptyMessage) {
            emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-results";
            emptyMessage.textContent = "No matching opportunities found.";
            jobGrid.appendChild(emptyMessage);
        }

        emptyMessage.style.display =
            visibleCount === 0 ? "block" : "none";
    }

    jobSearch?.addEventListener("input", filterOpportunities);
    jobType?.addEventListener("change", filterOpportunities);

    // =====================================
    // 10. DASHBOARD STATISTICS
    // =====================================

    function updateDashboard() {
        const completed = goals.filter(goal => goal.done).length;
        const total = goals.length;

        const readiness = total
            ? Math.round((completed / total) * 100)
            : 0;

        const readinessValue = document.getElementById("readinessValue");
        const readinessBar = document.getElementById("readinessBar");
        const readinessNote = document.getElementById("readinessNote");

        const skillsValue = document.getElementById("skillsValue");
        const goalsValue = document.getElementById("goalsValue");

        const ratedSkills = Object.keys(skillRatings).length;
        const score = calculateSkillScore();

        if (readinessValue) {
            readinessValue.textContent = `${readiness}%`;
        }

        if (readinessBar) {
            readinessBar.style.width = `${readiness}%`;
        }

        if (readinessNote) {
            readinessNote.textContent =
                `${completed} of ${total} milestones completed`;
        }

        if (skillsValue) {
            skillsValue.textContent = `${ratedSkills}/5`;
        }

        if (goalsValue) {
            goalsValue.textContent = total;
        }

        if (skillScore) {
            skillScore.textContent =
                ratedSkills === 5 ? `${score}%` : "--";
        }
    }

    // =====================================
    // 11. INITIALIZE APPLICATION
    // =====================================

    renderGoals();
    renderAssessment();
    filterOpportunities();
    updateDashboard();

});
