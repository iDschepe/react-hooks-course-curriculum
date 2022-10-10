import React from "react";
import queryString from "query-string";
import { fetchItem, fetchPosts, fetchComments } from "../utils/api";
import Loading from "./Loading";
import PostMetaInfo from "./PostMetaInfo";
import Title from "./Title";
import Comment from "./Comment";

function fetchReducer(state, action) {
  if (action.type === "loading") {
    return {
      ...state,
      loadingPost: true,
      post: null,
      error: null,
      comments: null,
      loadingComments: true,
    };
  } else if (action.type === "successPost") {
    return {
      ...state,
      loadingPost: false,
      post: action.post,
    };
  } else if (action.type === "successComments") {
    console.log(action.comments);
    return {
      ...state,
      loadingComments: false,
      comments: action.comments,
    };
  } else if (action.type === "error") {
    return {
      ...state,
      loadingComments: false,
      loadingPost: false,
      post: null,
      comments: null,
      error: action.message,
    };
  } else {
    throw new Error(`Action type ${action.type} is not supported!`);
  }
}

export default function Post() {
  const { id } = queryString.parse(window.location.search);
  const [state, dispatch] = React.useReducer(fetchReducer, {
    post: null,
    loadingPost: true,
    comments: null,
    loadingComments: true,
    error: null,
  });

  React.useEffect(() => {
    dispatch({ type: "loading" });

    fetchItem(id)
      .then((post) => {
        dispatch({
          type: "successPost",
          post,
        });
        return fetchComments(post.kids || []);
      })
      .then((comments) => dispatch({ type: "successComments", comments }))
      .catch(({ message }) => dispatch({ type: "error", message }));
  }, [id]);

  const { post, loadingPost, comments, loadingComments, error } = state;

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return (
    <React.Fragment>
      {loadingPost === true ? (
        <Loading text="Fetching post" />
      ) : (
        <React.Fragment>
          <h1 className="header">
            <Title url={post.url} title={post.title} id={post.id} />
          </h1>
          <PostMetaInfo
            by={post.by}
            time={post.time}
            id={post.id}
            descendants={post.descendants}
          />
          <p dangerouslySetInnerHTML={{ __html: post.text }} />
        </React.Fragment>
      )}
      {loadingComments === true ? (
        loadingPost === false && <Loading text="Fetching comments" />
      ) : (
        <React.Fragment>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
