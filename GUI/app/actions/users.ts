export const SET_USERS = 'SET_USERS';
export const UPSERT_USER = 'UPSERT_USER';

export function setUsers(users: any) {
  return {
    type: SET_USERS,
    users
  };
}

export function upsertUser(user: any) {
    return {
      type: UPSERT_USER,
      user
    };
  }
