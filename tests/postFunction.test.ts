
const data = require('./mock-data.js');


const returnPostsArray = (response) => {
    const posts = response.data.children.map(el => {
        return {
            "title": el.data.title,
            "upvotes": el.data.ups,
            "downvotes": el.data.downs,
            "score": el.data.score,
            "num_comments": el.data.num_comments,
            "created": el.data.created,
        }
    });

    const count = response.data.dist;

    return {
        "posts": posts,
        count
    }
};

const postArrayForTests = returnPostsArray(data);


const sortByParam = (param) => (prevPost, post) => {
    return post[`${param}`] - prevPost[`${param}`]
};

const returnBestPost = (posts) => {
    return posts.reduce((prevPost, currPost) => {

        if (prevPost.score !== currPost.score) {
            return (prevPost.score > currPost.score) ? prevPost : currPost
        } else if (prevPost.score === currPost.score) {
            return (prevPost.created > currPost.created) ? prevPost : currPost
        }
    });
};


const returnPostsFromLast24h = (posts) => posts.filter(post => {
    const time24HAgo = Date.now() - (24 * 60 * 60 * 1000);
    return post.created > Math.round(time24HAgo / 1000)
});



// this test is crucial if this fails rest will fail too
describe('loadData', function() {
    it('Testing post load function', function() {
        let result = returnPostsArray(data).posts.length > 0;
        expect(result).toBe(true);

    });
});


describe('return best post', function() {
    it('Testing if function return best post', function() {
        const bestPost = returnBestPost(postArrayForTests.posts);
        let result = postArrayForTests.posts.filter(post => post.upvotes >= bestPost.upvotes).length === 1;
        expect(result).toBe(true);

    });
});

describe('return latest posts', function() {
    it('Return if latest post isn\'t older than 24h.', function() {
        const latestPosts = returnPostsFromLast24h(postArrayForTests.posts);
        const time24HAgo = Math.round((Date.now() - (24 * 60 * 60 * 1000))/1000);
        let result = latestPosts.filter(post => post.created - time24HAgo < 0).length;
        console.log(result);
        expect(result).toBe(0);

    });
});

// that one must be latest one due to mutation
describe('sorting function', function() {
    it('First should be higher than second', function() {
        const sortedPosts = postArrayForTests.posts.sort(sortByParam('upvotes'));
        let result = sortedPosts[0].upvotes > sortedPosts[1].upvotes;
        expect(result).toBe(true);

    });
});

