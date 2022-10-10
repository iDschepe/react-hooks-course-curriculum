import React from "react";
import PropTypes from "prop-types";
import { fetchMainPosts } from "../utils/api";
import Loading from "./Loading";
import PostsList from "./PostsList";

function fetchReducer(state, action) {
  if (action.type === "data") {
    state.posts[action.postType] = action.data;
    return {
      ...state,
      loading: false,
    };
  } else if (action.type === "error") {
    return {
      ...state,
      loading: false,
      error: action.error,
    };
  } else if (action.type === "loading") {
    return {
      ...state,
      loading: true,
      error: null,
    };
  } else {
    throw new Error(`Action type ${action.type} is not supported!`);
  }
}

export default function Posts({ type }) {
  const [state, dispatch] = React.useReducer(fetchReducer, {
    posts: {},
    error: null,
    loading: true,
  });

  React.useEffect(() => {
    if (state.posts[type]) {
      return;
    }
    dispatch({
      type: "loading",
    });
    fetchMainPosts(type)
      .then((posts) =>
        dispatch({
          type: "data",
          data: posts,
          postType: type
        })
      )
      .catch(({ message }) =>
        dispatch({
          type: "error",
          error: message,
        })
      );
  }, [type]);

  const { posts, error, loading } = state;

  if (loading === true) {
    return <Loading />;
  }

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return <PostsList posts={posts[type] ? posts[type] : []} />;
}

Posts.propTypes = {
  type: PropTypes.oneOf(["top", "new"]),
};
