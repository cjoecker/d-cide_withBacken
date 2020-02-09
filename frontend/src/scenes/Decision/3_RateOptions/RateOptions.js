import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Paper from "@material-ui/core/Paper/Paper";
import Grid from "@material-ui/core/Grid/Grid";
import Slider from "@material-ui/lab/Slider/Slider";
import Typography from "@material-ui/core/Typography/Typography";
import RateSlider_Scale from "../../../images/RateSlider_Scale.svg";
import IconButton from "@material-ui/core/IconButton/IconButton";
import InfoIcon from '@material-ui/icons/Info';
import InfoDialog from "../../../components/InfoDialog";
import * as LongStrings from "../../../components/LongStrings";

import {connect} from "react-redux";
import {getRatedOptions, postRatedOptions} from "../../../services/actions/RatedOptions_Action";
import ReactGA from "react-ga";


const styles = theme => ({
    root: {
        flexGrow: 1,
        align: 'center',
        overflowX: 'hidden', //Avoid negative margin from mainGrid
    },

    mainDiv: {
        paddingTop: theme.spacing.unit * 2.5,
        paddingBottom: theme.spacing.unit * 5.5,
    },

    titleText: {
        textAlign: "center",
        marginTop: theme.spacing.unit * 1,
    },

    infoButton: {
        bottom: theme.spacing.unit * 0.25,
        left: theme.spacing.unit * 1,
    },

    paperDiv: {
        padding: theme.spacing.unit * 1,
    },

    cellTitle: {
        width: theme.spacing.unit * 100,
    },

    cellOptionTitle: {
        minWidth: theme.spacing.unit * 40,
        maxWidth: theme.spacing.unit * 50,
        alignContent: 'center',
        textAlign: 'center',
    },

    cellOption: {
        paddingBottom: theme.spacing.unit * 1,
    },

    cellOptionText: {
        textAlign: 'center',
        paddingLeft: theme.spacing.unit * 2,
    },


    sliderText: {
        paddingLeft: theme.spacing.unit * 1.8,
        paddingRight: theme.spacing.unit * 1.8,
        marginTop: theme.spacing.unit * 1,
    },

    slider: {
        opacity: 1,

    },

    sliderContainer: {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundSize: '100% ',
        backgroundImage: 'url(' + RateSlider_Scale + ')',
        backgroundRepeat: 'noRepeat',
        backgroundPosition: 'center',

    },

    sliderScale: {
        marginTop: -theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        alignContent: 'center',
        textAlign: 'center',
    },

    track: {
        opacity: 0.7,
    },

    emptyLine: {
        height: theme.spacing.unit * 4,
    },

});

class RateOptions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ratedCriteria: [],
            showInfo: false,
        };

        this.onChange = this.onChange.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onHideInfo = this.onHideInfo.bind(this);
        this.onShowInfo = this.onShowInfo.bind(this);
    }


    //Load Data from Server
    componentDidMount() {
        this.props.getRatedOptions(this.props.decisionId);
    }

    componentWillUnmount() {

        let ratedOptions = [];

        this.state.ratedCriteria.forEach(function (criteria) {

           criteria.decisionOption.forEach(function (option) {
               const ratedOption = {
                   score: option.score,
                   decisionOptionId: option.id,
                   selectionCriteriaId: criteria.id,
               };

               ratedOptions = [...ratedOptions, ratedOption];
           });
        });

        this.props.postRatedOptions(this.props.decisionId, ratedOptions);
    }


    //Refresh when redux state changes
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.rateOptions.ratedCriteria !== this.props.rateOptions.ratedCriteria) {
            if (this.props.rateOptions.ratedCriteria.length > 0) {
                this.setRatedOptions();
            }
        }
    }


    onDragEnd = (event, criteriaLocal, optionLocal) => {

        ReactGA.event({
            category: 'Rate Options',
            action: 'Drag End'
        });
    };


    onChange = (event, criteriaIndex, optionIndex, score) => {

        let ratedCriteriaLocal = this.state.ratedCriteria;

        ratedCriteriaLocal[criteriaIndex].decisionOption[optionIndex].score = score;

        this.setState({
            ratedCriteria: ratedCriteriaLocal,
        });

    };

    onHideInfo() {
        this.setState({showInfo: false,});

        ReactGA.event({
            category: 'Rate Options',
            action: 'Hide Info'
        });
    };

    onShowInfo = () => {
        this.setState({showInfo: true,});
        ReactGA.event({
            category: 'Rate Options',
            action: 'Show Info'
        });
    };

    setRatedOptions(){

        //get basic data
        let {selectionCriteria} = this.props.optionsAndCriteria;
        let {decisionOptions} = this.props.optionsAndCriteria;
        let importedRatedCriteria = [];
        let ratedCriteria = [];

        importedRatedCriteria = this.props.rateOptions.ratedCriteria;

        //Create nested object to summarize list
        selectionCriteria.forEach(function (criteria) {

            let decisionOptionLocal = [];

            //Add object properties
            decisionOptions.forEach(function (option) {
                let optionLocal = Object.assign({}, option);

                //Get old scores
                let objIndex = importedRatedCriteria.findIndex(obj =>
                    obj.selectionCriteriaId === criteria.id &&
                    obj.decisionOptionId === option.id
                );

                //Add scores if existing
                optionLocal.score = (objIndex >= 0) ? importedRatedCriteria[objIndex].score : 50;

                decisionOptionLocal = [...decisionOptionLocal, optionLocal];

            });

            //add objects to array
            criteria.decisionOption = decisionOptionLocal;
            ratedCriteria = [...ratedCriteria, criteria];
        });

        this.setState({ratedCriteria: ratedCriteria});
    }

    render() {
        const {classes} = this.props;

        return (

            <div className={classes.mainDiv}>
                <Grid container justify="center" alignContent='center' spacing={24}>
                    <Grid item xs={12} className={classes.titleText}>
                        <Typography variant="h5" gutterBottom>
                            Rate Options
                            <IconButton aria-label="Help" className={classes.infoButton} onClick={this.onShowInfo}>
                                <InfoIcon color="secondary"/>
                            </IconButton>
                        </Typography>
                    </Grid>
                    {this.state.ratedCriteria.map((criteria, criteriaIndex) =>
                        <Grid item xs={6} className={classes.cellOptionTitle} key={criteria.id}>
                            <Paper elevation={2} key={criteria.id}>
                                <div className={classes.paperDiv}>
                                    <Grid container spacing={16}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6">
                                                {criteria.name}
                                            </Typography>
                                        </Grid>
                                        {criteria.decisionOption.map((option, optionIndex) =>
                                            <Grid container justify="center" alignItems="center"
                                                  className={classes.cellOption} key={option.id}>
                                                <Grid item xs={4} className={classes.cellOptionText}>
                                                    {option.name}
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Grid container>
                                                        <Grid item xs={6} className={classes.sliderText}>
                                                            <Typography variant="caption"
                                                                        style={{fontSize: 11, textAlign: "left"}}>
                                                                Bad
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6} className={classes.sliderText}>
                                                            <Typography variant="caption"
                                                                        style={{fontSize: 11, textAlign: "right"}}>
                                                                Good
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} className={classes.sliderScale}>
                                                            <Slider
                                                                className={classes.slider}
                                                                classes={{
                                                                    trackAfter: classes.track,
                                                                    trackBefore: classes.track,
                                                                    container: classes.sliderContainer,
                                                                }}
                                                                value={option.score}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                onChange={(event, value) => this.onChange(event, criteriaIndex, optionIndex, value)}
                                                                onDragEnd={(event) => this.onDragEnd(event, criteria, option)}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        )}

                                    </Grid>
                                </div>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
                {/*Empty Line for Buttons*/}
                <div className={classes.emptyLine}/>
                {/*Info Dialogs*/}
                <InfoDialog
                    title={"Rate Options"}
                    text={LongStrings.OptionsRatingInfo}
                    show={this.state.showInfo}
                    hide={this.onHideInfo}
                />
            </div>
        );
    }
}

RateOptions.propTypes = {
    classes: PropTypes.object.isRequired,
    rateOptions: PropTypes.object.isRequired,
    getRatedOptions: PropTypes.func.isRequired,
    postRatedOptions: PropTypes.func.isRequired,
    optionsAndCriteria: PropTypes.object.isRequired,
    weightCriteria: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    rateOptions: state.rateOptions,
    optionsAndCriteria: state.optionsAndCriteria,
    weightCriteria: state.weightCriteria,
});


export default connect(mapStateToProps, {getRatedOptions, postRatedOptions})(withStyles(styles)(RateOptions));