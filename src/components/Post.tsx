import React, { useState, useEffect } from 'react'
import styles from "./Post.module.css"
import { db }from "../firebase"
import firebase from "firebase/app"
import { useSelector } from "react-redux"
import { selectUser } from "../features/userSlice"
import { Avatar } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import MessageIcon from "@material-ui/icons/Message"
import SendIcon from "@material-ui/icons/Send"

interface PROPS {
    postId: string;
    avatar: string;
    image: string;
    text: string;
    timestamp: any;
    userName: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  userName: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

export const Post: React.FC<PROPS> = (props) => {
    const classes = useStyles();
    const user = useSelector(selectUser);
    const [ comment, setComment ] = useState("");
    const [ openComments, setOpenComments ] = useState(false);
    const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      timestamp: null,
      userName: "",
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(props.postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            userName: doc.data().userName,
            timestamp: doc.data().timestamp,
          }))
        );
      });

    return () => {
      unSub();
    };
  }, [props.postId]);


    //ユーザーのコメント
    const newComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        db.collection("posts").doc(props.postId).collection("comments").add({
            avatar: user.photoUrl,
            text: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userName: user.displayName,
        })
        setComment("");
    }

    return (
        <div className={styles.post}>
          <div className={styles.post_avatar}>
            <Avatar src={props.avatar} />
          </div>
        <div className={styles.post_body} >
            <div>
                <div className={styles.post_header}>
                    <h3>
                        <span className={styles.post_headerUser}>@{props.userName}</span>
                        <span className={styles.post_headerTime}>
                            {new Date(props.timestamp?.toDate()).toLocaleString()}
                        </span>
                    </h3>
                </div>
            <div className={styles.post_tweet}>
                <p>{props.text}</p>
            </div>
        </div>
            {props.image && (
                <div className={styles.post_tweetImage}>
                    <img src={props.image} alt="tweet" />
                </div>
            )}

            {/* コメントの表示の切り替え */}
            <MessageIcon 
                className={styles.post_commentIcon}
                onClick={() => setOpenComments(!openComments)}
            />

    {openComments && (

         <>
            {/*データベースの内容を展開して表示する。　コメント用のアバター*/}
            {comments.map((com) => (
              <div key={com.id} >
                <Avatar src={com.avatar} className={classes.small}/>

                <span className={styles.post_commentUser}>@{com.userName}</span>
                <span className={styles.post_commentText}>{com.text} </span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

        <form onSubmit={newComment}>
            <div className={styles.post_form}>
                 <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                 <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
            </div>
        </form>
    </>

    )}
        </div>
        </div>
    )
}
