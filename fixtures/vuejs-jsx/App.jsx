import './App.css';
import './App.scss';
import './App.less';
import Hello from './components/Hello';

class TestClassSyntax {

}

export default {
  name: 'app',
  render() {
    return (
      <div id="app">
        <img src={require('./assets/logo.png')}/>
        <Hello></Hello>
      </div>
    );
  },
};
