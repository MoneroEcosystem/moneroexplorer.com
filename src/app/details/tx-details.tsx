import * as React from 'react';
import './details.scss';
import { formatApiDateStrings, toKB, fetchAsync } from 'utils/functions';
import { connect } from 'react-redux';
import { AppState } from 'redux/root-reducer';
import { NodeState } from 'redux/nodes/reducer';
import { RouteComponentProps } from 'react-router';
import { Node } from 'redux/nodes/actions';
import { minutesUntilMined } from 'utils/heuristic';
import { Link } from 'react-router-dom';
import { DetailsSkeleton } from './skeleton-details';
import { Tag } from 'components/tag';
import MetaTags from 'react-meta-tags';

type Props = NodeState & RouteComponentProps<{ transaction: string }>;

interface State {
  data: {
    transaction: any;
    pending: boolean;
    confirmationDuration: number | null;
  };
}

export class TxDetailsClass extends React.Component<Props, State> {
  public state = {
    data: { transaction: null, pending: false, confirmationDuration: null, txs: [] }
  };

  public UNSAFE_componentWillMount() {
    this.setState({ data: { ...this.state.data, pending: true } });
    this.setConfirmationDuration();
    this.fetchTransaction();
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.fetchTransaction();
    }
  }

  public setConfirmationDuration = () => {
    const { selectedNode, nodes } = this.props;
    const node = nodes.find(n => n.name === selectedNode) as Node;
    const txHash = this.props.match.params.transaction;
    let mempool: any[];
    let blocks: any[];
    const getMempool = fetchAsync(`${node.url}/api/mempool?limit=${10000}&page=${0}`).then(
      json => (mempool = json.data.txs)
    );
    const getBlocks = fetchAsync(`${node.url}/api/transactions?limit=${100}&page=${0}`).then(
      json => (blocks = json.data.blocks)
    );

    Promise.all([getMempool, getBlocks])
      .then(() => minutesUntilMined(txHash, mempool, blocks))
      .then(duration =>
        this.setState({ data: { ...this.state.data, confirmationDuration: duration } })
      );
  };

  public fetchTransaction = () => {
    const { nodes, selectedNode } = this.props;
    const node = nodes.find(n => n.name === selectedNode) as Node;

    this.setState({ data: { ...this.state.data, pending: true } });
    fetchAsync(node.url + '/api/transaction/' + this.props.match.params.transaction)
      .then(json => {
        this.setState({ data: { ...this.state.data, transaction: json.data, pending: false } });
      })
      .then(() => {
        this.fetchBlock();
      })
      .catch(error => {
        console.log(error);
      });
  };

  public fetchBlock = () => {
    const transaction = this.state.data.transaction as any;

    if (!transaction || !transaction.block_height) return;

    if (this.state.data.transaction) {
      const blockHeight = transaction.block_height;

      const { nodes, selectedNode } = this.props;
      const node = nodes.find(n => n.name === selectedNode) as Node;

      this.setState({ data: { ...this.state.data, pending: true } });
      fetchAsync(node.url + '/api/block/' + blockHeight)
        .then(json => {
          //const txs = json.data.txs.slice(0, 5);
          console.log(json)
          this.setState({ data: { ...this.state.data, pending: true } });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  public render() {
    const transaction = this.state.data.transaction as any;
    const txs = this.state.data.txs as any;

    return (
      <div className="Details card">
        {!!transaction ? (
          <>
            <MetaTags>
              <title>
                Monero (XMR) Transaction{' '}
                {transaction.tx_hash || this.props.match.params.transaction} — Monero Explorer Explorer
              </title>
              <meta
                name="description"
                content={`Monero (XMR) transaction ${transaction.tx_hash ||
                  this.props.match.params.transaction} - Monero Explorer`}
              />
              <meta
                property="og:title"
                content={`Monero (XMR) transaction ${transaction.tx_hash ||
                  this.props.match.params.transaction}`}
              />
              <meta
                name="og:title"
                content={`Monero Transaction ${transaction.tx_hash ||
                  this.props.match.params.transaction} | Monero Explorer`}
              />
              <meta
                name="og:description"
                content={`Monero (XMR) transaction ${transaction.tx_hash ||
                  this.props.match.params.transaction} - Monero Explorer`}
              />
              <meta
                property="og:url"
                content={`https://xmrscan.org/tx/${transaction.tx_hash ||
                  this.props.match.params.transaction}`}
              />
              <meta property="og:type" content="website" />
              <meta
                name="twitter:description"
                content={`Monero (XMR) transaction ${transaction.tx_hash ||
                  this.props.match.params.transaction} - Monero Explorer`}
              />
              <meta
                name="twitter:title"
                content={`Monero Transaction ${transaction.tx_hash ||
                  this.props.match.params.transaction} | Monero Explorer`}
              />
              <meta name="application-name" content="Monero Explorer" />
              <meta name="apple-mobile-web-app-title" content="Monero Explorer" />
            </MetaTags>
            {!transaction.tx_hash && (
              <h1 className="Details-header-title">
                Can&rsquo;t find transaction data for tx hash {this.props.match.params.transaction}
              </h1>
            )}
            {transaction.tx_hash && (
              <div className="Details-header">
                <h1 className="Details-header-title">
                  Monero (XMR) Transaction {transaction.tx_hash}
                </h1>
                <div className="flex-spacer" />

                {!transaction.block_height ? (
                  this.state.data.confirmationDuration ? (
                    <Tag
                      type="pending"
                      text={`Pending ~ ${this.state.data.confirmationDuration}m`}
                    />
                  ) : (
                    <Tag className="skeleton" type="pending" text="Pending ~ 2m" />
                  )
                ) : transaction.coinbase ? (
                  <Tag type="coinbase" text="COINBASE" />
                ) : null}
                <div className="Details-header-timestamp">
                  {formatApiDateStrings(transaction.timestamp_utc)}
                </div>
              </div>
            )}
            {transaction.tx_hash && (
              <div className="Details-body">
                <div className="Details-body-section">
                  <p className="Details-body-section-title">Transaction</p>
                  <div className="Details-body-section-content">
                    <div className="Details-body-section-content-input hash">
                      <p>Hash</p>
                      <p>{transaction.tx_hash}</p>
                    </div>
                    <div className="Details-body-section-content-input extra">
                      <p>Extra</p>
                      <p>{transaction.extra}</p>
                    </div>
                    <br />
                    {(transaction.payment_id || transaction.payment_id8) && (
                      <>
                        <div className="Details-body-section-content-input">
                          <p>Payment ID</p>
                          <p>{transaction.payment_id || transaction.payment_id8}</p>
                        </div>
                        <br />
                      </>
                    )}
                    <div className="Details-body-section-content-input">
                      <p>Fee</p>
                      <p>{(transaction.tx_fee / 1000000000000).toFixed(3)} / kB</p>
                    </div>
                  </div>
                </div>
                {!!transaction.block_height && (
                  <div className="Details-body-section">
                    <p className="Details-body-section-title">Block</p>
                    <div className="Details-body-section-content">
                      <div className="Details-body-section-content-input">
                        <p>Confirmations</p>
                        <p>{transaction.current_height - transaction.block_height}</p>
                      </div>
                      <div className="Details-body-section-content-input">
                        <p>Block Height</p>
                        <Link to={`/block/${transaction.block_height}`}>
                          {transaction.block_height}
                        </Link>
                      </div>
                      <div className="Details-body-section-content-input">
                        <p>Current Height</p>
                        <Link to={`/block/${transaction.current_height - 1}`}>
                          {transaction.current_height - 1}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                <div className="Details-body-section">
                  <p className="Details-body-section-title">Misc</p>
                  <div className="Details-body-section-content">
                    <div className="Details-body-section-content-input">
                      <p>Size</p>
                      <p>{toKB(transaction.tx_size)}</p>
                    </div>
                    <div className="Details-body-section-content-input">
                      <p>Ring Size</p>
                      <p>{transaction.mixin}</p>
                    </div>
                    <div className="Details-body-section-content-input">
                      <p>Transaction Version</p>
                      <p>{transaction.tx_version}</p>
                    </div>
                  </div>
                </div>
                {!!transaction.inputs && (
                  <div className="Details-body-section">
                    <p className="Details-body-section-title">Inputs</p>
                    <table className="Details-body-section-table Details-body-section-content">
                      <thead>
                        <tr>
                          <th>Key Image</th>
                          {transaction.tx_version === 1 && <th>Amount</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {transaction.inputs.map((input: any) => {
                          return (
                            <tr key={Math.random()}>
                              <td className="">{input.key_image}</td>
                              {transaction.tx_version === 1 && <td>{input.amount}</td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="Details-body-section">
                  <p className="Details-body-section-title">Outputs</p>
                  <table className="Details-body-section-table Details-body-section-content">
                    <thead>
                      <tr>
                        <th>Stealth Address</th>
                        {!!transaction.outputs[0].amount && <th>Amount</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.outputs.map((output: any) => {
                        return (
                          <tr key={Math.random()}>
                            <td>
                              <div className="wrap">{output.public_key}</div>
                            </td>
                            {!!output.amount && <td>{output.amount}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="Details-body-section">
                  <p>
                    Transaction {transaction.tx_hash} was carried out on the Monero network on{' '}
                    {formatApiDateStrings(transaction.timestamp_utc)}. The transaction has{' '}
                    {transaction.confirmations ? transaction.confirmations : 0}{' '}
                    {transaction.confirmations === 1 ? 'confirmation' : 'confirmations'} and was
                    assigned to block {transaction.block_height}. Payment ID for this Transaction is{' '}
                    {transaction.payment_id || transaction.payment_id8} and transaction fee was{' '}
                    {(transaction.tx_fee / 1000000000000).toFixed(3)} / kB.
                  </p>
                </div>
                {txs &&
                  txs.length && (
                    <div className="Details-body-section">
                      <p className="Details-body-section-title">Recent Transactions</p>
                      <table className="Details-body-section-table Details-body-section-content">
                        <thead>
                          <tr>
                            <th>Hash</th>
                            <th>Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txs.map((transaction: any, i: number) => {
                            return (
                              <tr key={i}>
                                <td>
                                  <div className="truncate">
                                    <div className="truncated">
                                      <Link to={`/tx/${transaction.tx_hash}`}>
                                        {transaction.tx_hash}
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                                <td>{toKB(transaction.tx_size)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            )}
          </>
        ) : (
          <DetailsSkeleton type="tx" />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    selectedNode: state.nodes.selectedNode,
    nodes: state.nodes.nodes
  };
};

export const TxDetails = connect(mapStateToProps)(TxDetailsClass);
