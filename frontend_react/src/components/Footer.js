import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark text-white p-4 text-start">
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        <h5 className='text-white'>Products</h5>
                        <ul className="list-unstyled">
                            <li className='text-white'>T-Shirts</li>
                            <li className='text-white'>Mugs</li>
                            <li className='text-white'>Hoodies</li>
                            <li className='text-white'>Tote Bags</li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className='text-white'>Support</h5>
                        <ul className="list-unstyled">
                            <li className='text-white'>Help Center</li>
                            <li className='text-white'>Contact Us</li>
                            <li className='text-white'>Shipping Info</li>
                            <li className='text-white'>Returns</li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className='text-white'>Company</h5>
                        <ul className="list-unstyled">
                            <li className='text-white'>About Us</li>
                            <li className='text-white'>Blog</li>
                            <li className='text-white'>Careers</li>
                            <li className='text-white'>Press</li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className='text-white'>Legal</h5>
                        <ul className="list-unstyled">
                            <li className='text-white'>Privacy Policy</li>
                            <li className='text-white'>Terms of Service</li>
                            <li className='text-white'>Cookie Policy</li>
                        </ul>
                    </div>
                </div>
                <hr style={{ borderColor: 'grey' }} />
                <p className="mt-3 text-center">© 2024 Custom Merchandise Store. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
