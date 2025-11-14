import '../styles/globals.css';
import Head from 'next/head';
import '@ant-design/v5-patch-for-react-19';
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../reducers/authSlice";
import cardsMaths from "../reducers/cardsMathsSlice";
import cardsPython from "../reducers/cardsPythonSlice";

const store = configureStore({
 reducer: {
    auth: authReducer,
    cardsMaths,
    cardsPython,
  },
}); 

unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});


function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>Mathsapp</title>
      </Head>
      <Nav/>
      <Component {...pageProps} />
      <Footer/>
    </Provider>
  );
}

export default App;
