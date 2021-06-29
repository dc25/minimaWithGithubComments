// Original code taken with permission from : https://github.com/dwilliamson/donw.io/blob/master/public/js/github-comments.js

async function getComments(repo_name, comment_id, page_id, acc )
{
    const url = "https://api.github.com/repos/" + repo_name + "/issues/" + comment_id + "/comments" + "?page=" + page_id;
    const resp = await fetch (url, { headers: {Accept: "application/vnd.github.v3.html+json"}});
    if (resp.status !== 200) {
        throw new Error("Response status " + resp.status + " while attempting to fetch comments from: " + url);
    }

    const comments = await resp.json();
    
    if (1 == page_id) {
        // post button 
        const url = "https://github.com/" + repo_name + "/issues/" + comment_id + "#new_comment_field";
        acc += ("<form action='" + url + "' rel='nofollow'> <input type='submit' value='Post a comment on Github' /> </form>");
    }

    // Individual comments
    for (let i = 0; i < comments.length; i++)
    {
        const comment = comments[i];
        const date = new Date(comment.created_at);

        acc += "<div id='gh-comment'>";
        acc += "<img src='" + comment.user.avatar_url + "' width='24px'>";
        acc += "<b><a href='" + comment.user.html_url + "'>" + comment.user.login + "</a></b>";
        acc += " posted at ";
        acc += "<em>" + date.toUTCString() + "</em>";
        acc += "<div id='gh-comment-hr'></div>";
        acc += comment.body_html;
        acc += "</div>";
    }

    // Call recursively if there are more pages to display

    const links = resp.headers.get("Link");
    if (links) {
        const entries = links.split(",");
        for (let j=0; j<entries.length; j++)
        {
            const entry = entries[j];
            if ("next" == entry.match(/rel="([^"]*)/)[1])
            {
                acc = await getComments(repo_name, comment_id, page_id+1, acc);
                break;
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
            const comments = await getComments(repo_name, comment_id, 1, "");
            const commentsElement = document.getElementById('gh-comments-list');
            commentsElement.innerHTML = comments;
        } catch (err)
        {
            console.log( err.message );
        }
        return null;
    });
}
