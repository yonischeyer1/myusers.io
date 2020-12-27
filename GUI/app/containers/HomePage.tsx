import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { setLoadingMessage } from '../actions/home';
import { upsertUser } from '../actions/users';
import Home from '../components/Home';

function mapStateToProps(state: any) {
  return {
    loadingMessage: state.loadingMessage,
    users: state.users,
    tests: state.tests
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setLoadingMessage,
      upsertUser,
      dispatch
    },
    dispatch
  );
}

  export default connect(mapStateToProps, mapDispatchToProps)(Home);
