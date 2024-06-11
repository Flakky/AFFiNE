import { notify, Tooltip } from '@affine/component';
import type { PaginationProps } from '@affine/component/member-components';
import { Pagination } from '@affine/component/member-components';
import { Avatar } from '@affine/component/ui/avatar';
import { AffineErrorBoundary } from '@affine/core/components/affine/affine-error-boundary';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useGetUserList, useGetUserListCount } from '../hooks';
import type { User } from '../types';
import { CreateUser } from './create-user';
import { DeleteUser } from './delete-user';
import * as styles from './index.css';
import { SearchUser } from './search-user';
import { UpdateUser } from './update-user';
const COUNT_PER_PAGE = 10;

export const UsersPanel = ({ userCount }: { userCount: number }) => {
  const [userSkip, setUserSkip] = useState(0);

  const onPageChange = useCallback<PaginationProps['onPageChange']>(offset => {
    setUserSkip(offset);
  }, []);

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [userListHeight, setUserListHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (
      userCount > COUNT_PER_PAGE &&
      listContainerRef.current &&
      userListHeight === null
    ) {
      const rect = listContainerRef.current.getBoundingClientRect();
      setUserListHeight(rect.height);
    }
  }, [listContainerRef, userCount, userListHeight]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>User List ({userCount})</div>
        <div className={styles.headerRightGroup}>
          <SearchUser />
          <CreateUser />
        </div>
      </div>
      <div
        ref={listContainerRef}
        style={userListHeight ? { height: userListHeight } : {}}
      >
        <Suspense>
          <UserList skip={userSkip} />
        </Suspense>

        {userCount > COUNT_PER_PAGE && (
          <Pagination
            totalCount={userCount}
            countPerPage={COUNT_PER_PAGE}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

const UserList = ({ skip }: { skip: number }) => {
  const users = useGetUserList(skip, COUNT_PER_PAGE);

  return <UserTable users={users} />;
};

const UserTable = ({ users }: { users: User[] }) => {
  return (
    <table className={styles.table}>
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '11%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '80px' }} />
      </colgroup>
      <thead>
        <tr>
          <ThWithToolTip content="ID" className={styles.shortHeader} />
          <ThWithToolTip content="Name" />
          <ThWithToolTip content="Email" />
          <ThWithToolTip content="Features" />
          <ThWithToolTip content="Email Verified" />
          <ThWithToolTip content="Has Password" />
          <ThWithToolTip content="Avatar" />
          <ThWithToolTip content="Actions" />
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <TdWithToolTip content={user.id} />
            <TdWithToolTip content={user.name} />
            <TdWithToolTip content={user.email} />
            <TdWithToolTip
              content={
                user.features.length === 0 ? 'null' : user.features.join(', ')
              }
              position="center"
            />
            <Tooltip content={user.emailVerified.toString()}>
              <td className={clsx(styles.tdContent, 'center')}>
                {user.emailVerified ? '✅' : '❌'}
              </td>
            </Tooltip>
            <Tooltip content={user.hasPassword?.toString() || 'null'}>
              <td className={clsx(styles.tdContent, 'center')}>
                {user.hasPassword ? '✅' : '❌'}
              </td>
            </Tooltip>
            <td className={clsx(styles.tdContent, 'center')}>
              <Avatar
                size={36}
                url={user.avatarUrl}
                name={(user.name ? user.name : user.email) as string}
              />
            </td>
            <td>
              <div className={styles.actions}>
                <UpdateUser user={user} />
                <DeleteUser user={user} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ThWithToolTip = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  return (
    <Tooltip content={content}>
      <th className={className}>{content}</th>
    </Tooltip>
  );
};

const TdWithToolTip = ({
  content,
  position,
}: {
  content: string;
  position?: 'left' | 'right' | 'center';
}) => {
  const handleClick = useCallback(() => {
    // copy to clipboard
    navigator.clipboard.writeText(content).then(
      () => {
        notify.success({
          title: 'Successfully copied',
          message: `Copied content: ${content}`,
        });
      },
      err => {
        notify.error({
          title: 'Copy failed, please try again.',
          message: err,
        });
        console.error('copy failed', err);
      }
    );
  }, [content]);
  return (
    <Tooltip content={content}>
      <td className={clsx(styles.tdContent, position)} onClick={handleClick}>
        {content}
      </td>
    </Tooltip>
  );
};

export const UsersListPanel = (): ReactElement | null => {
  const userCount = useGetUserListCount();
  return (
    <AffineErrorBoundary>
      <Suspense>
        <UsersPanel userCount={userCount} />
      </Suspense>
    </AffineErrorBoundary>
  );
};