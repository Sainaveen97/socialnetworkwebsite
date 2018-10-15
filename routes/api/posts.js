const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

//Load Post Model
const Post = require("../../models/post");

//Load Profile Model
const Profile = mongoose.model("profile");

//Load Posts Validation
const validatePostInput = require("../../validation/post");

//@route Get api/posts
//@desc Get post route
//@access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostsFound: "No posts found" }));
});

//@route Get api/posts/:id
//@desc Get post by id route
//@access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ noPostFound: "No post found by that Id" })
    );
});

//@route Post api/posts
//@desc Create post route
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) return res.status(400).json(errors);
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

//@route Post api/posts/like/:id
//@desc Like Post
//@access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res.status(400).json({ msg: "Already Liked this post" });
          }
          //Add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post Found" }));
    });
  }
);

//@route Post api/posts/unlike/:id
//@desc UnLike Post
//@access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notLiked: "You have not yet liked this post" });
          }
          //Remove user id to likes array
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post Found" }));
    });
  }
);

//@route Delete api/posts/:id
//@desc Delete post route
//@access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notAuthorized: "User not authorized" });
          }
          //Delete post
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post Found" }));
    });
  }
);

//@route POST api/posts/comment/:id
//@desc Add comment to post route
//@access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No Post found" }));
  }
);

//@route POST api/posts/comment/:id/:comment_id
//@desc Delete comment from post
//@access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //Check if comment exist
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return releaseEvents
            .status(404)
            .json({ commentsnotexists: "Comment does not exist" });
        }
        //Get remove Index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);
        //Splice comment out of array
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No Post found" }));
  }
);

module.exports = router;
