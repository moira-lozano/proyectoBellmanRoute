
import { Provider } from 'react-redux'; // Importa useDispatch
import { store } from './src1/Presentation/Redux/Store/store';
import RootNavigation from './src1/Presentation/Navigation/RootNavigation';
import { ErrorBoundary } from './src1/Presentation/Screens/VerificadorDeErrores';
// import * as Notifications from 'expo-notifications';
// import 'react-native-gesture-handler';


export default function App() {

  return (

    <Provider store={store}>
      <ErrorBoundary>
        <RootNavigation />
      </ErrorBoundary>
    </Provider>
  );
}
