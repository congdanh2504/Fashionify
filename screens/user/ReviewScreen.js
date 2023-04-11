import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import StarRating from 'react-native-star-rating';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import CustomButton from '../../components/CustomButton/CustomButton';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { network } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const ReviewScreen = ({ navigation, route }) => {
    const { product } = route.params;
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState([]);

    const fetchReviews = () => {
        var requestOptions = {
            method: "GET",
            redirect: "follow",
        };
        fetch(`${network.serverIP}/review/${product._id}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log(result)
            if (result.success) {
                setReviews(result.data)
            }
        })
    }

    const handleReviewChange = (text) => {
        setReview(text);
    };

    const handleSubmitReview = async () => {
        const value = await AsyncStorage.getItem("authUser"); // get authUser from async storage
        let user = JSON.parse(value);
        var myHeaders = new Headers();
        myHeaders.append("x-auth-token", user.token);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            comment: review,
            rating: rating,
            productId: product._id,
            date: (new Date()).toISOString().slice(0, 10)
        });

        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        fetch(network.serverIP + "/add-review", requestOptions);
        setRating(0);
        setReview('');
        fetchReviews();
    };

    useEffect(() => {
        fetchReviews();
    }, [])

  return (
    <View style={styles.container}>
        <View style={styles.topBarContainer}>
            <TouchableOpacity
            onPress={() => {
                navigation.goBack();
            }}
            >
            <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color={colors.muted}
            />
        </TouchableOpacity>
      </View>
      <View style={styles.reviewsContainer}>
        {reviews.length > 0 ? (
          reviews.map((item) => (
            <ReviewCard
              key={item._id}
              rating={item.rating}
              comment={item.comment}
              username={item.user.name}
              date={item.date}
            />
          ))
        ) : (
          <Text>No reviews yet.</Text>
        )}
      </View>
      <View style={styles.reviewInput}>
        <Text style={styles.label}>Rating:</Text>
        <StarRating
            disabled={false}
            maxStars={5}
            rating={rating}
            selectedStar={(rating) => setRating(rating)}
            fullStarColor={'#ffa500'}
            starSize={25}
            starStyle={{ marginRight: 10 }}
        />
        <Text style={styles.label}>Write a review:</Text>
        <TextInput
            style={styles.input}
            value={review}
            onChangeText={handleReviewChange}
            placeholder="Enter your review here"
            multiline
        />
        <CustomButton text={"Submit"} onPress={handleSubmitReview}/>
        {/* <Button title="Submit" onPress={handleSubmitReview} /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  topBarContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    height: 70,
    textAlignVertical: 'top',
  },
  reviewsContainer: {
    flex: 1,
  },
  reviewInput: {
    padding: 20,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: colors.white,
    width: "100%",
    height: 270,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
});

export default ReviewScreen;