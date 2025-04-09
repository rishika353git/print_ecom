import React, { useEffect } from 'react';
import Header from "./Header";
import Footer2 from './Footer2';
import ProductDetail from './ProductDetail';
import Process from './Process';
import Cart from './Cart';
const ProcessPage = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    },[])

    return (
        <>
            <Header /> {/* Add Header at the top */}
     
           <Process />
            <Footer2 /> {/* Use Footer2 instead of Footer */}
        </>
    );
};

export default ProcessPage;
