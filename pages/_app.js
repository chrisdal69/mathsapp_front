import '../styles/globals.css';
import Head from 'next/head';
import '@ant-design/v5-patch-for-react-19';
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';
import Menu from '../components/Menu';
import Footer from '../components/Footer';


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
    <>
      <Head>
        <title>Mathsapp</title>
      </Head>
      <Menu/>
      <Component {...pageProps} />
      <Footer/>
    </>
  );
}

export default App;
