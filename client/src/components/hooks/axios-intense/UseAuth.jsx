import React, { useContext } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';

const UseAuth = () => {
    const auth = useContext(AuthContext)
    // auth return the authInfo object
    return auth
};

export default UseAuth;