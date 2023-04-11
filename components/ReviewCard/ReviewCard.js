import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import StarRating from 'react-native-star-rating';

const ReviewCard = ({ userImage, rating, comment, username, date }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image source={{ uri: "https://static.vecteezy.com/system/resources/previews/008/442/086/original/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg" }} style={styles.userImage} />
        <View style={styles.reviewInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.comment}>{comment}</Text>
          <StarRating
            disabled={true}
            maxStars={5}
            rating={rating}
            fullStarColor={'#ffa500'}
            starSize={20}
            starStyle={{ marginRight: 10 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center'
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  reviewInfo: {
    flex: 1,
    alignItems: 'flex-start'
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  comment: {
    fontSize: 14,
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffa500',
  },
});

export default ReviewCard;