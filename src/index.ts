import {Component} from './modules/component'

window.onload = () => {

    type postsData = {
        posts: object[]
    };

    let postList: Component;
    let sortButton: Component;
    let postsData: postsData;
    let renderSelectedPostsBtns: Component;

    function loadDoc() {
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                postsData = showData(this.responseText);
                renderPostList(postsData);

            }
        };

        xhttp.open("GET", "https://www.reddit.com/r/funny.json", true);
        xhttp.send();
    }

    const showData = (response) => {
        const posts = JSON.parse(response).data.children.map(el => {
            return {
                "title": el.data.title,
                "upvotes": el.data.ups,
                "downvotes": el.data.downs,
                "score": el.data.score,
                "num_comments": el.data.num_comments,
                "created": el.data.created,
            }
        });

        const count = JSON.parse(response).data.dist;

        return {
            "posts": posts,
            count
        }
    };

    //2) napisać funkcję, która umożliwi sortowanie po "upvotes", "downvotes",
    // "score" lub dacie "created" w zależności od przekazanego parametru
    const sortByParam = (param) => (prevPost, post) => {
        console.log(param, 'param');
        return post[`${param}`] - prevPost[`${param}`]
    };
    //3) napisać funkcję, która zwróci tytuł postu z najwyższym stosunkiem głosów dodatnich
    // i ujemnych (w przypadku kilku postów o jednakowych współczynnikach, wybrać najnowszy z nich)

    const returnBestPost = (posts) => {
        return posts.reduce((prevPost, currPost) => {

            if (prevPost.score !== currPost.score) {
                return (prevPost.score > currPost.score) ? prevPost : currPost
            } else if (prevPost.score === currPost.score) {
                return (prevPost.created > currPost.created) ? prevPost : currPost
            }
        });
    };

    //4) napisać funkcję, która wyświetli posty tylko z ostatniego dnia (24h wstecz)

    const returnPostsFromLast24h = (posts) => posts.filter(post => {
        const time24HAgo = Date.now() - (24 * 60 * 60 * 1000);
        return post.created > Math.round(time24HAgo / 1000)
    });

    const renderPosts = (posts): string => {
        const postsToRender = posts.map(post => {
           return (
               '<li>' +
                    `<p>Title: ${post.title}</p>` +
                    '<div>' +
                        `<p class="score">Upvotes: ${post.upvotes}</p>` +
                        `<p class="score">Downvotes: ${post.downvotes}</p>` +
                    '</div>' +
               '</li>'
           )
        }).reduce((prev,curr) => prev + curr);

        return (
            '<ul>' + (postsToRender) + '</ul>'
        )
    };


    const renderPostList = (data) => {

        postList = new Component('#postList', {
            props: data.posts,
            template: () => {
                return (
                    '<div class="post-list">' +
                          (renderPosts(postList.props))+
                    '</div>'
                )
            }
        });


        postList.render();
    };

    renderSelectedPostsBtns = new Component('#sort-dropdown', {
        template: () => {
            return (
                '<button show-btn="showBestPost">' + 'Show best post' + '</button>'+
                '<button show-btn="showAllPosts">' + 'Show all posts' + '</button>' +
                '<button show-btn="reRenderPosts">' + 'Revert sorting' + '</button>'+
                '<button show-btn="showLatestPosts">' + 'Show posts from last 24h' + '</button>'
            )
        }
    });

    sortButton = new Component('#sort-btn', {
        template: () => {
            return (
                '<button sort-btn="sortPosts">' + 'Sort posts with selected option' + '</button>'
            )
        }
    });


    renderSelectedPostsBtns.render();
    sortButton.render();

    const clickHandler = function (event): void {
        // Check if a button was clicked
        const action = event.target.getAttribute('show-btn');
        const sortAction = event.target.getAttribute('sort-btn');

        const btnArray = document.getElementsByTagName('button');

        const filteredBtnArray = Array.from({length: btnArray.length}).map((item, index) => {
            if(btnArray[index].getAttribute('show-btn')){
                return btnArray[index]
            }
        }).filter(btn => btn !== undefined);

        filteredBtnArray.forEach(btn => btn.classList.remove('selectedBtn'));


        if(!event.target.classList.contains('selectedBtn') && action){
            event.target.classList.add('selectedBtn')
        }

        console.log(filteredBtnArray);

        if(sortAction === 'sortPosts'){
            const optionSelected = [0,1,2,3].map( i => {
                return document.getElementById(`checked${i}`)
            }).filter((input) => (input as any).checked)[0];

            const sortedPosts = postList.props.sort(sortByParam((optionSelected as HTMLInputElement).value));

            postList.setProps(sortedPosts);
            postList.render();
        } else if(action === 'showBestPost'){

            const bestPost = returnBestPost(postList.props)
            postList.setProps([bestPost]);

            postList.render();
        } else if(action === 'showAllPosts'){

            postList.setProps(postsData.posts)
            postList.render();
        } else if(action === 'reRenderPosts') {
            loadDoc();
        } else if (action === 'showLatestPosts') {
            postList.setProps(returnPostsFromLast24h(postList.props))
            postList.render();
        } else return;
    };


    loadDoc();
    document.addEventListener('click', clickHandler, false)
};







