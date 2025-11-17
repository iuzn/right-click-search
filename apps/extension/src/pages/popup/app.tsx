import Layout from '@/components/layout/Layout';
import Main from '@/components/views/Main';
import RootLayout from '@/components/layout/RootLayout';
 
export default function App() {
  return (
       <RootLayout>
        <Layout>
          <Main />
        </Layout>
      </RootLayout>
   );
}
