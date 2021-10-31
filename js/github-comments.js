// Original code taken with permission from : https://github.com/dwilliamson/donw.io/blob/master/public/js/github-comments.js
//

async function getComments(repo_name, comment_id, page_id, acc )
{
    const url = "https://api.github.com/repos/" + repo_name + "/issues/" + comment_id + "/comments" + "?page=" + page_id;
    const resp = await fetch (url, { headers: {Accept: "application/vnd.github.v3.html+json"}});
    if (resp.status !== 200) {
        throw new Error("Response status " + resp.status + " while attempting to fetch comments from: " + url);
    }

    const comments = await resp.json();
    
    // Individual comments
    for (let i = 0; i < comments.length; i++)
    {
        const comment = comments[i];
        const date = new Date(comment.created_at);
        acc.push( "<div id='gh-comment'>" + 
                    "<img src='" + comment.user.avatar_url + "' width='24px'>" + 
                    "<b><a href='" + comment.user.html_url + "'>" + comment.user.login + "</a></b>" + 
                    " posted at " + 
                    "<em>" + date.toUTCString() + "</em>" + 
                    "<div id='gh-comment-hr'></div>" + 
                    comment.body_html + 
                  "</div>" );
    }

    // Call recursively if there are more pages to display

    const links = resp.headers.get("Link");
    if (links) {
        const entries = links.split(",");
        for (let j=0; j<entries.length; j++)
        {
            const entry = entries[j];
            if (-1 != entry.search('rel="next"'))
            {
                acc = await getComments(repo_name, comment_id, page_id+1, acc);
                break; // recurse on "next" and then stop looking for "next".
            }
        }
    }
    return acc;
}

function DoGithubComments(repo_name, comment_id)
{
    document.addEventListener("DOMContentLoaded", async function() 
    {
        try {
            // post button 
            const url = "https://github.com/" + repo_name + "/issues/" + comment_id + "#new_comment_field";
            const comments = await getComments(repo_name, comment_id, 1, []);
            const commentsElement = document.getElementById('gh-comments-list');

            // choose one of the next two lines to determine display order (newest or oldest first).
            const commentsHtml = comments.join('');                // oldest first
            // const commentsHtml = comments.reverse().join('');   // newest first
            
            commentsElement.innerHTML = "<form action='" + url + "' rel='nofollow'> <input type='submit' value='Post a comment on Github' /> </form>" + commentsHtml;
        } catch (err)
        {
            console.log( err.message );
        }
        return null;
    });
}
