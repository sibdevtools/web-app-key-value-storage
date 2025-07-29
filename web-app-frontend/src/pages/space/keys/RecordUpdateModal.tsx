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

export const RecordUpdateModal: React.FC<RecordUpdateModalProps> = ({
                                                                      showModal,
                                                                      setShowModal,
                                                                      spaceRecord,
                                                                      handleSave
                                                                    }) => {
  const [value, setValue] = useState(spaceRecord.value);
  const [valueViewType, setValueViewType] = useState<ViewType>('base64');
  const [expiredAt, setExpiredAt] = useState<number | undefined>(spaceRecord.expiredAt);
  const [noExpirationDate, setNoExpirationDate] = useState<boolean>(!spaceRecord.expiredAt);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Update Record: <code>{spaceRecord.key}</code></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={() => {
          handleSave(spaceRecord.key, value, noExpirationDate ? undefined : expiredAt);
          return false;
        }}>
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
          <Form.Group controlId="expiratedAt">
            <Form.Label>Expired At</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                value={expiredAt ?? ''}
                disabled={noExpirationDate}
                onChange={(e) => setExpiredAt(+e.target.value)}
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowModal(false)}
          title={'Cancel'}
        >
          <Cancel01Icon />
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSave(spaceRecord.key, value, noExpirationDate ? undefined : expiredAt)}
          title={'Save'}
        >
          <FloppyDiskIcon />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
