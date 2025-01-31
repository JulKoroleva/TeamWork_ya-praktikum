import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { IListItemProps } from './ListItem.interface';
import styles from './ListItem.module.scss';

import { Reactions } from '@/components/EmojiReactions/EmojiReactions';
import { useEmojiPopupVisibility } from '@/hooks/useEmojiPopupVisibility.hook';
import { useRef } from 'react';
import { useDeleteForumEntity } from '@/hooks/useDeleteForumEntity';
import trashButton from '@/assets/icons/trash.svg';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/selectors';

export function ListItem({ topic }: IListItemProps) {
  const { id, title, createdAt, description, creator, comments, reactions } = topic;
  const { showPopup, handleMouseEnter, handleMouseLeave } = useEmojiPopupVisibility();
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const userInfo = useSelector(selectUser);

  const handleDelete = useDeleteForumEntity();

  const handleReadTopic = () => {
    navigate(ROUTES.topic(id));
  };

  return (
    <div className={styles['list-item']} onClick={handleReadTopic}>
      <div
        className={styles['list-item__container']}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={emojiRef}>
        <div className={styles['list-item__header']}>
          <span className={styles['list-item__author']}>{creator}</span>
          <div className={styles['list-item__params']}>
            {showPopup && userInfo.login === creator && (
              <button
                onClick={e => handleDelete(id, 'topic', e)}
                className={styles['list-item__delete-btn']}>
                <img src={trashButton} alt="delete" />
              </button>
            )}
            {comments !== 0 && (
              <span className={styles['list-item__message-count']}>{comments}</span>
            )}
          </div>
        </div>
        <div className={styles['list-item__info']}>
          <span className={styles['list-item__date']}>
            {createdAt.includes('-') ? new Date(createdAt).toDateString() : createdAt}
          </span>
        </div>
        <span className={styles['list-item__title']}>{title}</span>
        <span className={styles['list-item__description']}>{description}</span>

        <Reactions id={id} type="topic" reactions={reactions} />
      </div>

      {showPopup && (
        <div
          id="reaction-popup"
          className={styles['reaction-popup']}
          ref={emojiRef}
          onMouseLeave={handleMouseLeave}>
          <Reactions id={id} type="topic" showPopup={showPopup} emojiRef={emojiRef} />
        </div>
      )}
    </div>
  );
}
