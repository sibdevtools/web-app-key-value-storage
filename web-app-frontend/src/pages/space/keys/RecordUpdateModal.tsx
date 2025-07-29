import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { Cancel01Icon, FloppyDiskIcon } from 'hugeicons-react';
import React, { useState } from 'react';
import { getViewRepresentation, viewRepresentationToBase64, ViewType } from '../../../utils/view';
import { SpaceRecord } from './SpaceRecordsPage';

export interface RecordUpdateModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  spaceRecord: SpaceRecord;
  handleSave: (key: string, value: string, expiredAt: number | undefined) => void;
}

const formatExpiredAt = (timestamp: number | undefined): { date: string, time: string } => {
  if (!timestamp) {
    return { date: '', time: '' };
  }
  const date = new Date(timestamp);

  const pad = (num: number) => num.toString().padStart(2, '0');

  const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date.getMilliseconds().toString().padStart(
    3,
    '0'
  )}`;

  return {
    date: formattedDate,
    time: formattedTime
  };
};

export const RecordUpdateModal: React.FC<RecordUpdateModalProps> = ({
                                                                      showModal,
                                                                      setShowModal,
                                                                      spaceRecord,
                                                                      handleSave
                                                                    }) => {
  const [value, setValue] = useState(spaceRecord.value);
  const [valueViewType, setValueViewType] = useState<ViewType>('base64');
  const { date: initialDate, time: initialTime } = formatExpiredAt(spaceRecord.expiredAt);
  const [expiredAtDate, setExpiredAtDate] = useState<string>(initialDate);
  const [expiredAtTime, setExpiredAtTime] = useState<string>(initialTime);
  const [noExpirationDate, setNoExpirationDate] = useState<boolean>(!spaceRecord.expiredAt);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d-]/g, '');
    if (value.length === 4 || value.length === 7) {
      if (value.charAt(value.length - 1) !== '-') {
        value += '-';
      }
    }
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setExpiredAtDate(value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d:.]/g, '');
    if (value.length === 2 || value.length === 5) {
      if (value.charAt(value.length - 1) !== ':') {
        value += ':';
      }
    }
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    setExpiredAtTime(value);
  };

  const calculateExpiredAt = (): number | undefined => {
    if (noExpirationDate) {
      return undefined;
    }
    const dateTimeString = `${expiredAtDate}T${expiredAtTime}`;
    const expiredAt = new Date(dateTimeString);
    return expiredAt.getTime();
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSave(spaceRecord.key, value, calculateExpiredAt());
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Update Record: <code>{spaceRecord.key}</code></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="valueViewType">
            <Form.Label>Value View Type</Form.Label>
            <Form.Select
              value={valueViewType}
              onChange={(e) => setValueViewType(e.target.value as ViewType)}
              required={true}
            >
              <option value={'base64'}>Base64</option>
              <option value={'raw'}>Raw</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="value">
            <Form.Label>Value</Form.Label>
            <Form.Control
              type="text"
              value={getViewRepresentation(valueViewType, value)}
              onChange={(e) => setValue(viewRepresentationToBase64(valueViewType, e.target.value))}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Expired At</Form.Label>
            <InputGroup>
              <Form.Control
                id={'expiredAtDate'}
                type="text"
                pattern={'^\\d{4}-\\d{2}-\\d{2}$'}
                value={expiredAtDate}
                disabled={noExpirationDate}
                required={true}
                placeholder={'yyyy-MM-dd'}
                onChange={handleDateChange}
              />
              <InputGroup.Text>T</InputGroup.Text>
              <Form.Control
                id={'expiredAtTime'}
                type="text"
                pattern={'^\\d{2}:\\d{2}:\\d{2}(\.\\d{3})?$'}
                value={expiredAtTime}
                disabled={noExpirationDate}
                required={true}
                placeholder={'HH:mm:ss.zzz'}
                onChange={handleTimeChange}
              />
              <InputGroup.Text>
                <Form.Check
                  type="checkbox"
                  checked={noExpirationDate}
                  onChange={(e) => setNoExpirationDate(e.target.checked)}
                />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            type={'button'}
            onClick={() => setShowModal(false)}
            title={'Cancel'}
          >
            <Cancel01Icon />
          </Button>
          <Button
            variant={'primary'}
            type={'submit'}
            title={'Save'}
          >
            <FloppyDiskIcon />
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
