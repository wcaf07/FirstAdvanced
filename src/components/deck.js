import React, { Component } from 'react'
import {View, Animated, PanResponder, Dimensions, StyleSheet, LayoutAnimation, UIManager} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25
const SWIPE_OUT_DURATION = 250

export default class Deck extends Component {

    static defaultProps = {
        onSwipeRight:() => {},
        onSwipeLeft:() => {},
    }

    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
        LayoutAnimation.spring();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== this.props.data) {
            this.setState({ index : 0 });
        }
    }

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

        this.state = {
            index: 0
        }
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
            }).start(() => this.onSwipeComplete())
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;

        const item = data[this.state.index];
        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
        this.position.setValue( { x : 0, y : 0} );
        this.setState({ index : this.state.index + 1})
    }

    renderCard() {
        if(this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCards()
        }
        return this.props.data.map((item, i) => {
            if (i < this.state.index) {
                return null;
            } else if (i == this.state.index) {
                return (
                    <Animated.View
                        key={item.id}
                        {...this.responder.panHandlers}
                        style={[this.getCardStyle(), styles.cardStyle]}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
            return(
                <Animated.View style={[styles.cardStyle, { top: 10 * (i - this.state.index)}]} key={item.id}>
                    {this.props.renderCard(item)}
                </Animated.View>
            );
        }).reverse();
    }

    render() {
        return(
            <View>
                {this.renderCard()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
})