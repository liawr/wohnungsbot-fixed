import React from 'react';
import type { FlatAddress, FlatContactDetails } from '../../reducers/data';
import styles from '../Configuration.scss';
import applicationTextBuilder from '../../flat/applicationTextBuilder';

type ApplicationTextPreviewsProps = {
  applicationText: string;
  className: string;
};
type ApplicationTextPreviewsState = {
  previewIndex: number;
};
export default class ApplicationTextPreviews extends React.Component<
  ApplicationTextPreviewsProps,
  ApplicationTextPreviewsState
> {
  static TestFlats: Array<{
    address: FlatAddress;
    contact: FlatContactDetails;
  }> = [
    {
      address: {
        street: 'Hermannstr.',
        houseNumber: '177',
        neighborhood: 'Neukölln',
        postcode: '12051',
        description: '' // mandatory field, not used for preview
      },
      contact: {
        firstName: 'Helga',
        lastName: 'Schneider',
        salutation: 'FEMALE'
      }
    },
    {
      address: {
        street: 'Richardplatz',
        neighborhood: 'Neukölln',
        postcode: '12055',
        description: '' // mandatory field, not used for preview
      },
      contact: {
        salutation: 'NO_SALUTATION'
      }
    },
    {
      address: {
        neighborhood: 'Neukölln',
        postcode: '12049',
        description: '' // mandatory field, not used for preview
      },
      contact: {
        salutation: 'MALE',
        firstName: 'Richard',
        lastName: 'Meier'
      }
    }
  ];

  props: ApplicationTextPreviewsProps;

  state: ApplicationTextPreviewsState;

  constructor(props) {
    super(props);
    this.state = {
      previewIndex: 0
    };
    setInterval(
      () =>
        this.setState((previousState: ApplicationTextPreviewsState) => ({
          previewIndex:
            (previousState.previewIndex + 1) %
            ApplicationTextPreviews.TestFlats.length
        })),
      5000
    );
  }

  render() {
    const { applicationText, className } = this.props;
    const { previewIndex } = this.state;
    return (
      <>
        <pre className={className}>
          {applicationTextBuilder(
            applicationText,
            ApplicationTextPreviews.TestFlats[previewIndex].address,
            ApplicationTextPreviews.TestFlats[previewIndex].contact
          )}
        </pre>
        <div className={styles.comment}>
          Beispiel {previewIndex + 1} von{' '}
          {ApplicationTextPreviews.TestFlats.length}
        </div>
      </>
    );
  }
}
