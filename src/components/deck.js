import React, { Component } from 'react'
import {View, Animated, PanResponder, Dimensions, ScrollView} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25
const SWIPE_OUT_DURATION = 250

export default class Deck extends Component {

    constructor(props) {
        super(props);

        const position = new Animated.ValueXY();
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({x : gesture.dx, y : gesture.dy});
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe('right')
                } else if(gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe('left')
                } else {
                    this.resetPosition()
                }
            }
        })

        this.position = position;
        this.responder = panResponder;
    }

    getCardStyle() {

        const rotate = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5 ,0 , SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        })
        return {
            ...this.position.getLayout(),
            transform: [{ rotate}]
        }
    }

    resetPosition() {
        Animated.spring(this.position, 
            {
                toValue: {x : 0, y : 0}
            }).start();
    }

    forceSwipe(direction) {
        const x = direction == 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
        Animated.timing(this.position,
            {
                toValue: {x : x, y : 0},
                duration: SWIPE_OUT_DURATION
            }).start()
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight } = this.props;
        direction === 'right' ? onSwipeRight() : onSwipeLeft()
    }

    renderCard() {
        return this.props.data.map((item, index) => {
            if (index == 0) {
                return (
                    <Animated.View
                        key={item.id}
                        {...this.responder.panHandlers}
                        style={this.getCardStyle()}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
            return this.props.renderCard(item);
        })
    }

    render() {
        return(
            <ScrollView>
                {this.renderCard()}
            </ScrollView>
        )
    }
}