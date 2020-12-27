export const SET_TESTS = 'SET_TESTS';
export const UPSERT_TEST = 'UPSERT_TEST';

export function setTests(tests: any) {
  return {
    type: SET_TESTS,
    tests
  };
}

// export function upsertUser(user: any) {
//     return {
//       type: UPSERT_USER,
//       user
//     };
//   }
