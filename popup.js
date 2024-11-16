document.addEventListener("DOMContentLoaded", () => {
  const getProblemsBtn = document.getElementById("get-problems-btn");
  const problemsList = document.getElementById("problems-list");
  let givenProblems = JSON.parse(localStorage.getItem("givenProblems")) || [];

  const renderProblems = (problems) => {
    problemsList.innerHTML = ""; // Clear the list

    problems.forEach((problem) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <a href="https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}" target="_blank">${problem.name}</a>
        <input type="checkbox" id="problem-${problem.contestId}-${problem.index}" disabled> Solved
      `;
      problemsList.appendChild(listItem);
    });
  };

  const storeAndRenderProblems = (problems) => {
    givenProblems = problems;
    localStorage.setItem("givenProblems", JSON.stringify(givenProblems)); // Save to localStorage
    renderProblems(givenProblems);
  };

  if (givenProblems.length > 0) {
    renderProblems(givenProblems); // Render previously assigned problems
  }

  getProblemsBtn.addEventListener("click", () => {
    const userHandle = document.getElementById("user-handle").value.trim();

    if (!userHandle) {
      alert("Please enter a valid Codeforces handle.");
      return;
    }

    fetch(`https://codeforces.com/api/user.info?handles=${userHandle}`)
      .then(response => response.json())
      .then(userData => {
        if (userData.status === "FAILED") {
          alert("Invalid user handle. Please try again.");
          return;
        }

        const userRating = userData.result[0].rating;

        fetch("https://codeforces.com/api/problemset.problems")
          .then(response => response.json())
          .then(problemData => {
            const problems = problemData.result.problems;

            const filteredProblems = problems.filter(
              problem => problem.rating && problem.rating >= userRating - 200 && problem.rating <= userRating + 200
            );

            const randomProblems = filteredProblems.sort(() => 0.5 - Math.random()).slice(0, 3);

            storeAndRenderProblems(randomProblems); // Store problems in localStorage and render them
          })
          .catch(error => {
            console.error("Error fetching problems:", error);
            alert("Error fetching problems from Codeforces.");
          });
      })
      .catch(error => {
        console.error("Error fetching user rating:", error);
        alert("There was an issue retrieving your user rating. Please try again.");
      });
  });
});
