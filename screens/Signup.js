import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { supabase } from '../utils/supabase';

export default function RegisterPage({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoginButtonPressed, setIsLoginButtonPressed] = useState(false);

    const toSignIn = () => {
        navigation.navigate('LoginScreen');
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }
    
        try {
            // Step 1: Register the user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });
    
            if (error) {
                console.error("Auth Error:", error.message);
                Alert.alert("Registration failed", error.message);
                return;
            }
    
            const userId = data.user?.id;
            if (!userId) {
                Alert.alert("Error", "Failed to retrieve user ID after registration.");
                return;
            }
    
            // Step 2: Fetch random user profile picture
            let profilePictureUrl = null;
            try {
                const response = await fetch('https://randomuser.me/api/');
                if (!response.ok) throw new Error("Failed to fetch profile picture");
    
                const json = await response.json();
                profilePictureUrl = json.results[0]?.picture?.large || null;
            } catch (apiError) {
                console.error("Profile Picture Error:", apiError.message);
            }
    
            // Step 3: Insert user data into the custom `users` table
            const { error: dbError } = await supabase.from('users').insert([
                {
                    id: userId,
                    email: email,
                    student_id: studentId,
                    first_name: firstName,
                    last_name: lastName,
                    profile_picture: profilePictureUrl,
                },
            ]);
    
            if (dbError) {
                console.error("Database Error:", dbError.message);
                Alert.alert("Registration failed", "Failed to save user details.");
                return;
            }
    
            Alert.alert(
                "Registration Successful",
                "Please check your email to verify your account."
            );
    
            // Navigate to login screen
            navigation.navigate('LoginScreen');
        } catch (err) {
            console.error("Unexpected Error:", err.message);
            Alert.alert("Registration failed", "An unexpected error occurred.");
        }
    };
    
    const toTerms = () => {
        navigation.navigate('TermsOfService');
    };

    return (
        <>
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <Text style={styles.registerText}>Register</Text>

                <TextInput
                    style={styles.studentId} 
                    placeholder="Student ID"
                    placeholderTextColor="#fff"
                    value={studentId}
                    onChangeText={setStudentId}
                />
                <TextInput
                    style={styles.firstName}
                    placeholder="First name"
                    placeholderTextColor="#fff"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={styles.lastName}
                    placeholder="Last name"
                    placeholderTextColor="#fff"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <TextInput
                    style={styles.userEmail}
                    placeholder="Email address"
                    placeholderTextColor="#fff"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.password}
                    placeholder="Enter password"
                    placeholderTextColor="#fff"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.rePassword}
                    placeholder="Re-enter password"
                    placeholderTextColor="#fff"
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                    style={[
                        styles.registerButton,
                        { backgroundColor: isLoginButtonPressed ? '#35343B' : '#20AB7D' },
                    ]}
                    onPressIn={() => setIsLoginButtonPressed(true)}
                    onPressOut={() => setIsLoginButtonPressed(false)}
                    onPress={handleRegister} // Register the user on button press
                >
                    <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>

                <View style={styles.loginText}>
                    <Text style={styles.isMemberText}>Already have an account? </Text>
                    <TouchableOpacity onPress={toSignIn}>
                        <Text style={styles.signInText}>Sign in here.</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.TOS}>
                    <Text style={styles.agreeText}>By using this app, you are agreeing to our </Text>
                    <TouchableOpacity>
                        <Text style={styles.terms} onPress={toTerms}>Terms of Service.</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    // Same styles as before
    container: {
        flex: 1,
        backgroundColor: '#25242B',
    },
    registerText: {
        color: '#20AB7D',
        fontSize: 40,
        alignSelf: 'center',
        marginTop: '38%',
        fontWeight: 'bold',
    },
    firstName: {
        backgroundColor: '#17171B',
        color: '#fff',
        width: '75%',
        height: 50,
        alignSelf: 'center',
        marginTop: '4%',
        borderRadius: 12,
        paddingLeft: 20,
    },
    lastName: {
        backgroundColor: '#17171B',
        color: '#fff',
        width: '75%',
        height: 50,
        alignSelf: 'center',
        marginTop: '4%',
        borderRadius: 12,
        paddingLeft: 20,
    },
    userEmail: {
        backgroundColor: '#17171B',
        color: '#fff',
        width: '75%',
        height: 50,
        alignSelf: 'center',
        marginTop: '4%',
        borderRadius: 12,
        paddingLeft: 20,
    },
    studentId: { // New style for Student ID input
        backgroundColor: '#17171B',
        color: '#fff',
        width: '75%',
        height: 50,
        alignSelf: 'center',
        marginTop: '4%',
        borderRadius: 12,
        paddingLeft: 20,
    },
    password: {
        backgroundColor: '#17171B',
        color: '#fff',
        width: '75%',
        height: 50,
        alignSelf: 'center',
        marginTop: '4%',
        borderRadius: 12,
        paddingLeft: 20,
    },
    rePassword: {
        backgroundColor: '#17171B',
        color: '#fff',
        width: '75%',
        height: 50,
        alignSelf: 'center',
        marginTop: '4%',
        borderRadius: 12,
        paddingLeft: 20,
    },
    registerButton: {
        height: 50,
        width: '75%',
        alignSelf: 'center',
        marginTop: '10%',
        borderRadius: 15,
    },
    registerButtonText: {
        color: '#fff',
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: 44,
    },
    loginText: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: '7%',
    },
    isMemberText: {
        color: '#fff',
    },
    signInText: {
        color: '#20AB7D',
    },
    TOS: {
        alignSelf: 'center',
        marginTop: '15.7%',
    },
    agreeText: {
        color: '#fff',
    },
    terms: {
        color: '#20AB7D',
        textAlign: 'center',
    },
});
