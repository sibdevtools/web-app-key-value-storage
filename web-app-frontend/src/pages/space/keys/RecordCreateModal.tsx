import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { Cancel01Icon, FloppyDiskIcon } from 'hugeicons-react';
import React, { useState } from 'react';
import { getViewRepresentation, viewRepresentationToBase64, ViewType } from '../../../utils/view';

export interface RecordCreateModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  handleSave: (key: string, value: string, expiredAt: number | undefined) => void;
}

export const RecordCreateModal: React.FC<RecordCreateModalProps> = ({
                                                                      showModal,
                                                                      setShowModal,
                                                                      handleSave
                                                                    }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [valueViewType, setValueViewType] = useState<ViewType>('base64');
  const [expiredAtDate, setExpiredAtDate] = useState<string>('');
  const [expiredAtTime, setExpiredAtTime] = useState<string>('');
  const [noExpirationDate, setNoExpirationDate] = useState(true);

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
        handleSave(key, value, calculateExpiredAt());
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="keyCode">
            <Form.Label>Key</Form.Label>
            <Form.Control
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required={true}
            />
          </Form.Group>
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
                onChange={(e) => setExpiredAtDate(e.target.value)}
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
                onChange={(e) => setExpiredAtTime(e.target.value)}
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
