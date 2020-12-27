import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { setUsers } from '../actions/users';
import UsersComp from '../components/Users/Users';

function mapStateToProps(state: any) {
  return {
    users: state.users
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
        setUsers
    },
    dispatch
  );
}

  export default connect(mapStateToProps, mapDispatchToProps)(UsersComp);
