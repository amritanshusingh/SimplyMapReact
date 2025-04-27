import { Grid, Card, CardContent, Typography } from '@mui/material';
import InsightsIcon from '@mui/icons-material/InsightsTwoTone';
import TripOriginIcon from '@mui/icons-material/TripOriginTwoTone';
import JoinInnerIcon from '@mui/icons-material/JoinInnerTwoTone';
import JoinFullIcon from '@mui/icons-material/JoinFullTwoTone';
import TollTwoToneIcon from '@mui/icons-material/TollTwoTone';
import ControlPointDuplicateRoundedIcon from '@mui/icons-material/ControlPointDuplicateRounded';
import React from 'react';

const CardGridComponent: React.FC = () => {
  const cardData = [
    {
      icon: <InsightsIcon sx={{ fontSize: 40, mb: 1 }} />,
      title: 'Point to Line (KML)',
      description: 'Get a Line KML file by converting your Points KML File',
    },
    {
      icon: <TripOriginIcon sx={{ fontSize: 40, mb: 1 }} />,
      title: 'Buffer',
      description: 'Create a desired buffer around your polygon kml files',
    },
    {
      icon: <JoinInnerIcon sx={{ fontSize: 40, mb: 1 }} />,
      title: 'Intersection',
      description: 'Perform intersection on two polygons',
    },
    {
      icon: <JoinFullIcon sx={{ fontSize: 40, mb: 1 }} />,
      title: 'Union',
      description: 'Perform Join Operation on two polygons',
    },
    {
      icon: <TollTwoToneIcon sx={{ fontSize: 40, mb: 1 }} />,
      title: 'Subtract Feature (Minus)',
      description: 'Subtract one polygon from another polygon. Resultant will be what remains of the first polygon. If polygons don\'t overlap, first polygon will be the result as it is.',
    },
    {
      icon: <ControlPointDuplicateRoundedIcon sx={{ fontSize: 40, mb: 1 }} />,
      title: 'Add Polygons',
      description: 'Add two polygons. Different from union, it adds two polygons even if they don\'t intersect each other. Resultant is a single shapefile/kml file containing both polygons.',
    },
  ];

  return (
    <Grid container spacing={2} columns={12} justifyContent="center" component="div">
      {cardData.map((card, index) => (
        <Grid
          item
          component="div"
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={index}
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          <Card sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' }, maxWidth: 300 }}>
            <CardContent>
              {card.icon}
              <Typography variant="h5" component="div">
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CardGridComponent;