chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProblems") {
    const userHandle = request.userHandle;

    // Fetch the user's rating
    fetch(`https://codeforces.com/api/user.info?handles=${userHandle}`)
      .then(response => response.json())
      .then(userData => {
        if (userData.status === 'FAILED') {
          sendResponse({ error: 'Invalid user handle. Please try again.' });
          return;
        }

        const userRating = userData.result[0].rating;

        // Fetch all problems from Codeforces
        fetch('https://codeforces.com/api/problemset.problems')
          .then(response => response.json())
          .then(problemData => {
            const problems = problemData.result.problems;

            // Filter problems close to the user's rating
            const filteredProblems = problems.filter(problem => 
              problem.rating && problem.rating >= userRating - 200 && problem.rating <= userRating + 200
            );

            // Randomly select 3 problems
            const randomProblems = filteredProblems.sort(() => 0.5 - Math.random()).slice(0, 3);

            sendResponse({ problems: randomProblems });
          })
          .catch(error => {
            console.error('Error fetching problems:', error);
            sendResponse({ error: 'Error fetching problems from Codeforces.' });
          });
      })
      .catch(error => {
        console.error('Error fetching user rating:', error);
        sendResponse({ error: 'Error fetching user rating from Codeforces.' });
      });

    return true;  // Return true to indicate we will send a response asynchronously
  }
});
